import type { Locale } from "./locales";

interface HomeContent {
  kicker: string;
  title: string;
  description: string;
  imageAlt: string;
  nav: { download: string; guide: string; tools: string; faq: string; history: string; language: string; theme: string; menu: string };
  footer: { description: string; links: string; utilities: string; legal: string; status: string; active: string; temporary: string; audio: string; thumbnail: string; terms: string; privacy: string; copyright: string };
  faq: Array<{ question: string; answer: string }>;
}

export const HOME_CONTENT: Record<Locale, HomeContent> = {
  vi: {
    kicker: "AN TOÀN · MINH BẠCH · NHANH CHÓNG", title: "Tải video từ mọi nền tảng, nhanh và miễn phí", description: "Dán link video để xem các tùy chọn tải xuống thực sự có sẵn.", imageAlt: "Minh họa màn hình video và biểu tượng tải xuống",
    nav: { download: "Tải video", guide: "Hướng dẫn", tools: "Kho tiện ích", faq: "FAQ", history: "Lịch sử", language: "Chọn ngôn ngữ", theme: "Đổi giao diện", menu: "Mở menu" },
    footer: { description: "Công cụ phân tích và tải media công khai nhanh chóng, minh bạch và dễ sử dụng.", links: "Liên kết", utilities: "Tiện ích", legal: "Điều khoản", status: "Trạng thái", active: "Hệ thống hoạt động", temporary: "File chỉ được lưu tạm trong thời gian xử lý.", audio: "Tải âm thanh", thumbnail: "Tải ảnh bìa", terms: "Điều khoản sử dụng", privacy: "Chính sách riêng tư", copyright: "Bản quyền" },
    faq: [{ question: "Web có miễn phí không?", answer: "Có. Các chức năng cơ bản không yêu cầu đăng ký." }, { question: "Có lưu video trên server không?", answer: "File chỉ được giữ tạm trong thời gian xử lý theo cấu hình hệ thống." }],
  },
  en: {
    kicker: "SAFE · TRANSPARENT · FAST", title: "Download public videos quickly and free", description: "Paste a video link to see the download options that are actually available.", imageAlt: "Video screen and download icon illustration",
    nav: { download: "Download", guide: "Guide", tools: "Tools", faq: "FAQ", history: "History", language: "Choose language", theme: "Change theme", menu: "Open menu" },
    footer: { description: "A fast and transparent tool for analyzing and downloading public media.", links: "Links", utilities: "Utilities", legal: "Legal", status: "Status", active: "System operational", temporary: "Files are stored only temporarily while processing.", audio: "Download audio", thumbnail: "Download thumbnail", terms: "Terms of use", privacy: "Privacy policy", copyright: "Copyright" },
    faq: [{ question: "Is this service free?", answer: "Yes. Basic features do not require registration." }, { question: "Are videos stored on the server?", answer: "Files are kept temporarily only for the configured processing period." }],
  },
  es: {
    kicker: "SEGURO · TRANSPARENTE · RÁPIDO", title: "Descarga vídeos públicos de forma rápida y gratuita", description: "Pega un enlace para ver las opciones de descarga realmente disponibles.", imageAlt: "Ilustración de una pantalla de vídeo y un icono de descarga",
    nav: { download: "Descargar", guide: "Guía", tools: "Herramientas", faq: "FAQ", history: "Historial", language: "Elegir idioma", theme: "Cambiar tema", menu: "Abrir menú" },
    footer: { description: "Herramienta rápida y transparente para analizar y descargar contenido público.", links: "Enlaces", utilities: "Utilidades", legal: "Legal", status: "Estado", active: "Sistema operativo", temporary: "Los archivos solo se guardan temporalmente.", audio: "Descargar audio", thumbnail: "Descargar miniatura", terms: "Términos de uso", privacy: "Privacidad", copyright: "Derechos de autor" },
    faq: [{ question: "¿El servicio es gratuito?", answer: "Sí. Las funciones básicas no requieren registro." }, { question: "¿Se guardan los vídeos?", answer: "Los archivos solo se conservan temporalmente durante el procesamiento." }],
  },
  ja: {
    kicker: "安全 · 透明 · 高速", title: "公開動画をすばやく無料で保存", description: "動画リンクを貼り付けて、実際に利用できる形式を確認します。", imageAlt: "動画画面とダウンロードアイコンのイラスト",
    nav: { download: "動画保存", guide: "使い方", tools: "ツール", faq: "FAQ", history: "履歴", language: "言語を選択", theme: "テーマ変更", menu: "メニューを開く" },
    footer: { description: "公開メディアをすばやく確認して保存するための透明性の高いツールです。", links: "リンク", utilities: "機能", legal: "規約", status: "状態", active: "稼働中", temporary: "ファイルは処理中のみ一時保存されます。", audio: "音声を保存", thumbnail: "サムネイルを保存", terms: "利用規約", privacy: "プライバシー", copyright: "著作権" },
    faq: [{ question: "無料で使えますか？", answer: "はい。基本機能は登録不要です。" }, { question: "動画はサーバーに保存されますか？", answer: "処理に必要な期間だけ一時保存されます。" }],
  },
  fr: {
    kicker: "SÛR · TRANSPARENT · RAPIDE", title: "Téléchargez rapidement des vidéos publiques", description: "Collez un lien pour afficher les options réellement disponibles.", imageAlt: "Illustration d’un écran vidéo et d’une icône de téléchargement",
    nav: { download: "Télécharger", guide: "Guide", tools: "Outils", faq: "FAQ", history: "Historique", language: "Choisir la langue", theme: "Changer le thème", menu: "Ouvrir le menu" },
    footer: { description: "Un outil rapide et transparent pour analyser et télécharger des médias publics.", links: "Liens", utilities: "Outils", legal: "Mentions", status: "État", active: "Système opérationnel", temporary: "Les fichiers ne sont conservés que temporairement.", audio: "Télécharger l’audio", thumbnail: "Télécharger la miniature", terms: "Conditions d’utilisation", privacy: "Confidentialité", copyright: "Droits d’auteur" },
    faq: [{ question: "Le service est-il gratuit ?", answer: "Oui. Les fonctions de base ne nécessitent pas d’inscription." }, { question: "Les vidéos sont-elles stockées ?", answer: "Les fichiers ne sont conservés que temporairement pendant le traitement." }],
  },
  pt: {
    kicker: "SEGURO · TRANSPARENTE · RÁPIDO", title: "Transfere vídeos públicos de forma rápida e gratuita", description: "Cola uma ligação para veres as opções realmente disponíveis.", imageAlt: "Ilustração de um ecrã de vídeo e ícone de transferência",
    nav: { download: "Transferir", guide: "Guia", tools: "Ferramentas", faq: "FAQ", history: "Histórico", language: "Escolher idioma", theme: "Mudar tema", menu: "Abrir menu" },
    footer: { description: "Uma ferramenta rápida e transparente para analisar e transferir conteúdos públicos.", links: "Ligações", utilities: "Utilitários", legal: "Legal", status: "Estado", active: "Sistema operacional", temporary: "Os ficheiros são guardados apenas temporariamente.", audio: "Transferir áudio", thumbnail: "Transferir miniatura", terms: "Termos de utilização", privacy: "Privacidade", copyright: "Direitos de autor" },
    faq: [{ question: "O serviço é gratuito?", answer: "Sim. As funções básicas não exigem registo." }, { question: "Os vídeos são guardados?", answer: "Os ficheiros só são mantidos temporariamente durante o processamento." }],
  },
  ko: {
    kicker: "안전 · 투명 · 빠름", title: "공개 동영상을 빠르고 무료로 저장", description: "동영상 링크를 붙여넣어 실제 제공되는 다운로드 옵션을 확인하세요.", imageAlt: "동영상 화면과 다운로드 아이콘 일러스트",
    nav: { download: "다운로드", guide: "사용 방법", tools: "도구", faq: "FAQ", history: "기록", language: "언어 선택", theme: "테마 변경", menu: "메뉴 열기" },
    footer: { description: "공개 미디어를 빠르고 투명하게 분석하고 저장하는 도구입니다.", links: "링크", utilities: "기능", legal: "정책", status: "상태", active: "정상 작동 중", temporary: "파일은 처리하는 동안에만 임시 저장됩니다.", audio: "오디오 저장", thumbnail: "썸네일 저장", terms: "이용 약관", privacy: "개인정보 처리방침", copyright: "저작권" },
    faq: [{ question: "무료인가요?", answer: "네. 기본 기능은 가입 없이 사용할 수 있습니다." }, { question: "서버에 동영상을 저장하나요?", answer: "처리에 필요한 시간 동안만 임시로 보관합니다." }],
  },
};
