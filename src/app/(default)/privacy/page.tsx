import { LegalPage } from "@/components/legal-page";
import type { Metadata } from "next";
export const metadata: Metadata = { alternates: { canonical: "/privacy" } };
export default function PrivacyPage() { return <LegalPage title="Chính sách riêng tư"><p>Chúng tôi xử lý URL để phân tích nội dung và tạo file tạm. Không lưu binary video trong localStorage.</p><h2>Dữ liệu cục bộ</h2><p>Lịch sử tải xuống chỉ lưu metadata cơ bản trên trình duyệt và bạn có thể xóa bất kỳ lúc nào.</p><h2>Lưu trữ tạm thời</h2><p>File trên server được cô lập theo job và tự động xóa khi hoàn tất thời hạn cấu hình, thất bại hoặc hết hạn.</p></LegalPage>; }
