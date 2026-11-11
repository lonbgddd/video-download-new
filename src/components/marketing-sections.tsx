"use client";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowRight, ChevronDown, Clipboard, Download, Gauge, Infinity, Link2, MonitorSmartphone, ShieldCheck } from "lucide-react";

const features = [
  { Icon: Gauge, title: "Tải nhanh", text: "Phân tích và chuẩn bị video chỉ trong vài bước." },
  { Icon: Infinity, title: "Miễn phí", text: "Không yêu cầu đăng ký cho các chức năng cơ bản." },
  { Icon: ShieldCheck, title: "Chất lượng cao", text: "Hiển thị các chất lượng thực sự có sẵn từ nguồn." },
  { Icon: MonitorSmartphone, title: "Đa thiết bị", text: "Hoạt động tốt trên desktop, tablet và mobile." },
];
export function FeatureCards() { return <section className="feature-grid" aria-label="Lợi ích">{features.map(({ Icon, title, text }) => <article className="feature-card" key={title}><span><Icon/></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</section>; }

export function HowItWorks() { const steps = [{ Icon: Link2, title: "Sao chép link", text: "Sao chép liên kết nội dung bạn có quyền tải." }, { Icon: Clipboard, title: "Dán link", text: "Dán liên kết vào ô tìm kiếm ở phía trên." }, { Icon: Download, title: "Chọn & tải", text: "Chọn định dạng và chất lượng phù hợp." }]; return <section className="how-section" id="guide"><div><p className="eyebrow">3 bước đơn giản</p><h2>Cách tải video rất đơn giản</h2><div className="steps">{steps.map(({ Icon, title, text }, index) => <div className="step" key={title}><span className="step-number">{index + 1}</span><span className="step-icon"><Icon/></span><div><h3>{title}</h3><p>{text}</p></div>{index < 2 && <ArrowRight className="step-arrow"/>}</div>)}</div></div><Faq/></section>; }

const faqs = [
  ["Web có miễn phí không?", "Có. Các chức năng cơ bản không yêu cầu đăng ký hay thanh toán."],
  ["Những nền tảng nào được hỗ trợ?", "Link media trực tiếp được hỗ trợ mặc định. Các nền tảng khác ở trạng thái Limited và cần yt-dlp trên server."],
  ["Có cần đăng ký tài khoản không?", "Không. Lịch sử được lưu cục bộ ngay trên trình duyệt của bạn."],
  ["Tại sao một số video không tải được?", "Nội dung riêng tư, bị giới hạn, có DRM hoặc vượt giới hạn hệ thống sẽ không được xử lý."],
  ["File tải về được lưu ở đâu?", "Trình duyệt lưu file vào thư mục tải xuống của thiết bị. Server chỉ giữ file tạm theo thời hạn cấu hình."],
  ["Có tải được chất lượng cao không?", "Có nếu extractor thực sự tìm thấy format đó. Giao diện không tự tạo hoặc quảng cáo chất lượng không tồn tại."],
  ["Có lưu video trên server không?", "File chỉ tồn tại tạm trong directory cô lập của job và được dọn theo JOB_TTL hoặc khi job thất bại, timeout hay hết hạn."],
];
function Faq() { return <div className="faq" id="faq"><p className="eyebrow">Giải đáp nhanh</p><h2>Câu hỏi thường gặp</h2><Accordion.Root type="single" collapsible>{faqs.map(([question, answer], index) => <Accordion.Item value={`faq-${index}`} key={question}><Accordion.Header><Accordion.Trigger>{question}<ChevronDown/></Accordion.Trigger></Accordion.Header><Accordion.Content>{answer}</Accordion.Content></Accordion.Item>)}</Accordion.Root></div>; }
