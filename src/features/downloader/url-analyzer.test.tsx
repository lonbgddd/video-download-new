import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { UrlAnalyzer } from "./url-analyzer";

function renderAnalyzer() { return render(<QueryClientProvider client={new QueryClient()}><UrlAnalyzer/></QueryClientProvider>); }
describe("UrlAnalyzer", () => {
  it("shows a validation message for an invalid URL", async () => {
    renderAnalyzer(); await userEvent.type(screen.getByLabelText("URL video"), "khong-phai-url"); await userEvent.click(screen.getByRole("button", { name: "Phân tích" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("URL hợp lệ");
  });
  it("renders the honest empty state", () => { renderAnalyzer(); expect(screen.getByText("Kết quả tải xuống sẽ xuất hiện tại đây")).toBeInTheDocument(); });
});
