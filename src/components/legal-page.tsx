import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) { return <main className="legal-page"><Link className="brand" href="/vi"><span className="brand-icon"><Download/></span>VideoDownloader</Link><article><Link className="back-link" href="/vi"><ArrowLeft/> Quay lại trang chủ</Link><h1>{title}</h1>{children}<p className="legal-updated">Cập nhật: 11/11/2026</p></article></main>; }
