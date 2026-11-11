const base = "http://127.0.0.1:4173";
const sourceUrl = "https://samplelib.com/preview/mp4/sample-5s.mp4";

const analyze = await fetch(`${base}/api/media/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: sourceUrl }) }).then((response) => response.json());
if (!analyze.success) throw new Error(`Analyze failed: ${JSON.stringify(analyze)}`);
const media = analyze.data.media;
const format = media.formats[0];
const created = await fetch(`${base}/api/download`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mediaId: media.id, formatId: format.id, type: format.type }) }).then((response) => response.json());
if (!created.success) throw new Error(`Create job failed: ${JSON.stringify(created)}`);

let job;
for (let attempt = 0; attempt < 30; attempt += 1) {
  const payload = await fetch(`${base}/api/jobs/${created.data.jobId}`).then((response) => response.json());
  if (!payload.success) throw new Error(`Poll failed: ${JSON.stringify(payload)}`);
  job = payload.data.job;
  if (job.status === "completed") break;
  if (["failed", "expired"].includes(job.status)) throw new Error(`Job ended as ${job.status}: ${job.message}`);
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (!job?.downloadUrl) throw new Error("Job did not expose an opaque download URL");
const download = await fetch(`${base}${job.downloadUrl}`);
const bytes = (await download.arrayBuffer()).byteLength;
if (!download.ok || bytes < 100_000 || !download.headers.get("content-disposition")?.startsWith("attachment")) throw new Error("Download response validation failed");
console.log(JSON.stringify({ analyze: "passed", job: job.status, download: "passed", bytes, contentType: download.headers.get("content-type") }, null, 2));
