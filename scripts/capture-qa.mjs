import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9333;
const targetUrl = process.env.QA_URL ?? "http://127.0.0.1:4173/";
const outputPrefix = process.env.QA_OUTPUT_PREFIX ?? "implementation";
const processHandle = spawn(chrome, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`,
  "--user-data-dir=/tmp/video-downloader-cdp", "--no-first-run", "about:blank",
], { stdio: "ignore" });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function ready() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { const response = await fetch(`http://127.0.0.1:${port}/json/version`); if (response.ok) return; } catch {}
    await wait(100);
  }
  throw new Error("Chrome DevTools endpoint did not become ready");
}

async function capture({ width, height, file, mobile = false }) {
  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }).then((response) => response.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl); let sequence = 0; const pending = new Map(); const consoleErrors = [];
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) { const { resolve, reject } = pending.get(message.id); pending.delete(message.id); if (message.error) reject(new Error(message.error.message)); else resolve(message.result); }
    if (message.method === "Runtime.exceptionThrown" || (message.method === "Log.entryAdded" && message.params.entry.level === "error")) consoleErrors.push(message.params);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
  await send("Page.navigate", { url: targetUrl }); await wait(1800);
  if (!mobile) {
    await send("Runtime.evaluate", { expression: `(() => { const input = document.querySelector('input[aria-label="URL video"]'); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, 'https://samplelib.com/preview/mp4/sample-5s.mp4'); input.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('.url-analyzer').requestSubmit(); })()` });
    await wait(6500);
  }
  const metrics = await send("Runtime.evaluate", { expression: `({ innerWidth, innerHeight, bodyWidth: document.body.scrollWidth, htmlWidth: document.documentElement.scrollWidth, title: document.title, overflow: [...document.querySelectorAll('body *')].map((element) => ({ selector: element.className || element.tagName, right: element.getBoundingClientRect().right, width: element.getBoundingClientRect().width })).filter((item) => item.right > innerWidth + 1).slice(0, 8) })`, returnByValue: true });
  const image = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(file, Buffer.from(image.data, "base64"));
  let interactions = {};
  if (mobile) {
    await send("Runtime.evaluate", { expression: `document.querySelector('.mobile-menu-button')?.click()` }); await wait(200);
    const result = await send("Runtime.evaluate", { expression: `({ menuButton: Boolean(document.querySelector('.mobile-menu-button')), menuOpened: Boolean(document.querySelector('.mobile-nav')), themeClass: document.documentElement.className })`, returnByValue: true }); interactions = result.result.value;
  } else {
    await send("Runtime.evaluate", { expression: `document.querySelector('.icon-pill')?.click()` }); await wait(150);
    const result = await send("Runtime.evaluate", { expression: `({ resultVisible: Boolean(document.querySelector('.media-result')), headerVisible: Boolean(document.querySelector('.site-header')), themeClassAfterToggle: document.documentElement.className })`, returnByValue: true }); interactions = result.result.value;
  }
  socket.close();
  return { metrics: metrics.result.value, interactions, consoleErrors: consoleErrors.map((entry) => entry.entry?.text ?? entry.exceptionDetails?.exception?.description ?? entry.exceptionDetails?.text ?? "unknown") };
}

try {
  await ready();
  const desktop = await capture({ width: 1536, height: 1024, file: `${outputPrefix}-desktop.png` });
  const mobile = await capture({ width: 390, height: 844, file: `${outputPrefix}-mobile.png`, mobile: true });
  console.log(JSON.stringify({ desktop, mobile }, null, 2));
} finally { processHandle.kill("SIGTERM"); }
