import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UrlAnalyzer } from "./url-analyzer";

function renderAnalyzer() { return render(<QueryClientProvider client={new QueryClient()}><UrlAnalyzer/></QueryClientProvider>); }
afterEach(() => vi.unstubAllGlobals());
describe("UrlAnalyzer", () => {
  it("shows a validation message for an invalid URL", async () => {
    renderAnalyzer(); await userEvent.type(screen.getByLabelText("URL video"), "khong-phai-url"); await userEvent.click(screen.getByRole("button", { name: "Phân tích" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("URL hợp lệ");
  });
  it("renders the honest empty state", () => { renderAnalyzer(); expect(screen.getByText("Kết quả tải xuống sẽ xuất hiện tại đây")).toBeInTheDocument(); });
  it("opens a validated direct stream in a new tab for long videos", async () => {
    const tab = { opener: window, location: { replace: vi.fn() }, close: vi.fn() };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        success: false,
        error: { code: "MEDIA_TOO_LONG", message: "Video dài hơn giới hạn cho phép." },
      }), { status: 413, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { directUrl: "https://cdn.example/video" },
      }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("open", vi.fn(() => tab));
    const user = userEvent.setup();
    renderAnalyzer();

    await user.type(screen.getByLabelText("URL video"), "https://www.youtube.com/watch?v=test123");
    await user.click(screen.getByRole("button", { name: "Phân tích" }));
    await user.click(await screen.findByRole("button", { name: "Mở luồng video trực tiếp ở tab mới" }));

    expect(fetchMock).toHaveBeenLastCalledWith("/api/media/direct-link", expect.objectContaining({ method: "POST" }));
    expect(tab.location.replace).toHaveBeenCalledWith("https://cdn.example/video");
    expect(tab.opener).toBeNull();
  });
});
