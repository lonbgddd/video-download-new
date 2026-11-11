import { LegalPage } from "@/components/legal-page";
import type { Metadata } from "next";
export const metadata: Metadata = { alternates: { canonical: "/terms" } };
export default function TermsPage() { return <LegalPage title="Điều khoản sử dụng"><p>Bạn chỉ được sử dụng VideoDownloader với nội dung do bạn sở hữu, được cấp phép hoặc có quyền tải xuống.</p><h2>Trách nhiệm của người dùng</h2><p>Bạn chịu trách nhiệm tuân thủ điều khoản của nguồn nội dung và pháp luật hiện hành. Không dùng dịch vụ để xâm phạm bản quyền hoặc quyền riêng tư.</p><h2>Giới hạn dịch vụ</h2><p>Dịch vụ có thể từ chối nội dung riêng tư, bị hạn chế, có DRM, vượt giới hạn dung lượng hoặc thời lượng.</p></LegalPage>; }
