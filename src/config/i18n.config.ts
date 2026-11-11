import { createProgrammaticLandingPages } from "./programmatic-seo";
import { LOCALES, type Locale } from "./locales";
export { LOCALE_INFO, LOCALES, type Locale } from "./locales";

export type LandingCategory = "video" | "audio";

export interface LocalizedFaq {
  question: string;
  answer: string;
}

export interface LocalizedLandingContent {
  topic: string;
  slug: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  keywords: string[];
  benefits: string[];
  steps: string[];
  faqs: LocalizedFaq[];
}

export interface SeoLandingPage {
  id: string;
  category: LandingCategory;
  relatedGroup?: string;
  updatedAt: string;
  content: Partial<Record<Locale, LocalizedLandingContent>>;
}

export const SITE_NAME = "VideoDownloader";

const CORE_LANDING_PAGES: SeoLandingPage[] = [
  {
    id: "public-video",
    category: "video",
    updatedAt: "2026-11-11",
    content: {
      en: {
        topic: "video-downloader",
        slug: "fast-free-video-downloader",
        title: "Fast, free video downloads for public media",
        description: "Save public videos you have permission to use. Check available formats first, then download without installing desktop software.",
        heading: "Keep a useful video close at hand",
        intro: "Need a clip for a class, a presentation, or an offline trip? Paste a public video link to see which formats the source actually offers. No mystery quality menu and no desktop app to install.",
        keywords: ["fast free video downloader", "download public videos", "save video for offline viewing"],
        benefits: [
          "See source-provided formats before you choose a download.",
          "Use the browser on your phone or computer; nothing to install.",
          "Downloads are prepared only after you select a format.",
        ],
        steps: ["Copy the link to a public video you are allowed to save.", "Paste it into the analyzer and review the available formats.", "Choose a format and save the file to your device."],
        faqs: [
          { question: "Can I download any video I find online?", answer: "Only download media you own or have permission to save. Private, DRM-protected, or restricted content is not supported." },
          { question: "Do I need to install an app?", answer: "No desktop app is required. The site checks public links in your browser." },
        ],
      },
      vi: {
        topic: "cong-cu-tai-video",
        slug: "tai-video-cong-khai-nhanh",
        title: "Tải video công khai nhanh, gọn ngay trên trình duyệt",
        description: "Dán link để xem định dạng nguồn đang có rồi lưu video bạn được phép sử dụng. Không cần cài phần mềm máy tính.",
        heading: "Lưu video cần dùng, không phải cài thêm ứng dụng",
        intro: "Chuẩn bị clip cho bài giảng, chuyến đi xa hay lúc mạng chập chờn? Dán liên kết công khai để xem định dạng thực tế trước khi tải. Chọn đúng bản cần dùng, khỏi mò mẫm trong danh sách chất lượng không rõ nguồn.",
        keywords: ["tải video nhanh trên web", "lưu video xem ngoại tuyến", "tải video không cần cài phần mềm"],
        benefits: [
          "Xem định dạng nguồn cung cấp trước khi chọn tải.",
          "Dùng ngay trên điện thoại hoặc máy tính, không cài app.",
          "Chỉ tạo file sau khi bạn chọn định dạng.",
        ],
        steps: ["Sao chép link video công khai mà bạn có quyền lưu.", "Dán link vào công cụ và kiểm tra các định dạng đang có.", "Chọn bản phù hợp rồi lưu về thiết bị."],
        faqs: [
          { question: "Có tải được mọi video trên mạng không?", answer: "Chỉ tải nội dung bạn sở hữu hoặc được phép lưu. Video riêng tư, có DRM hoặc bị hạn chế không được hỗ trợ." },
          { question: "Có cần cài ứng dụng không?", answer: "Không cần cài ứng dụng máy tính; bạn kiểm tra link công khai ngay trên trình duyệt." },
        ],
      },
      es: {
        topic: "descargar-videos",
        slug: "guardar-videos-publicos-sin-instalar",
        title: "Guarda vídeos públicos sin instalar programas",
        description: "Comprueba los formatos disponibles y guarda vídeos públicos que tengas derecho a usar, directamente desde el navegador.",
        heading: "Un vídeo útil, también cuando no hay conexión",
        intro: "Para una clase, una presentación o un viaje: pega el enlace público y revisa primero las opciones reales de la fuente. Así eliges con criterio, sin instalar otra aplicación ni adivinar la calidad.",
        keywords: ["descargar vídeos gratis rápido", "guardar vídeos para ver sin conexión", "descargador de vídeos online"],
        benefits: [
          "Consulta los formatos disponibles antes de empezar.",
          "Funciona desde el navegador del móvil o del ordenador.",
          "El archivo se prepara después de elegir una opción.",
        ],
        steps: ["Copia el enlace de un vídeo público que puedas guardar.", "Pégalo en el analizador y consulta los formatos disponibles.", "Elige una opción y guarda el archivo en tu dispositivo."],
        faqs: [
          { question: "¿Puedo descargar cualquier vídeo de Internet?", answer: "Descarga solo contenido propio o autorizado. No se admiten vídeos privados, restringidos o protegidos con DRM." },
          { question: "¿Tengo que instalar una aplicación?", answer: "No hace falta instalar nada en el ordenador; puedes analizar enlaces públicos desde el navegador." },
        ],
      },
      ja: {
        topic: "douga-download",
        slug: "koukai-douga-offline-hozon",
        title: "公開動画をブラウザーから手軽に保存",
        description: "公開リンクの配信形式を確認して、利用許可のある動画を端末へ保存。専用ソフトのインストールは不要です。",
        heading: "あとで見たい動画を、必要なときに手元へ",
        intro: "授業の資料や移動中の視聴用に動画を残したいときは、公開リンクを貼り付けて配信元の形式を確認しましょう。画質を推測して選ぶ必要はなく、パソコン用ソフトも不要です。",
        keywords: ["動画 ダウンロード 無料", "動画 オフライン 保存", "ブラウザー 動画 保存"],
        benefits: [
          "ダウンロード前に配信元の形式を確認できます。",
          "スマートフォンとパソコンのブラウザーで利用できます。",
          "形式を選んでからファイルを準備します。",
        ],
        steps: ["保存する許可のある公開動画のリンクをコピーします。", "入力欄に貼り付け、利用できる形式を確認します。", "形式を選んで端末に保存します。"],
        faqs: [
          { question: "ネット上の動画なら何でも保存できますか？", answer: "自分が所有する動画、または保存が許可された動画のみご利用ください。非公開、DRM、アクセス制限のある動画には対応しません。" },
          { question: "アプリのインストールは必要ですか？", answer: "パソコン用アプリは不要です。ブラウザーから公開リンクを確認できます。" },
        ],
      },
    },
  },
  {
    id: "youtube-video",
    category: "video",
    updatedAt: "2026-11-11",
    content: {
      en: {
        topic: "video-downloader",
        slug: "youtube-video-to-mp4",
        title: "Save a public YouTube video as MP4",
        description: "Check whether a compatible YouTube video format is available, then save an authorized public video for offline use.",
        heading: "A practical MP4 option for a public video",
        intro: "When you need a clip that plays on common devices, start by checking the formats exposed for that public YouTube link. Pick a compatible option and keep the video only when you have permission to do so.",
        keywords: ["YouTube to MP4 online", "save YouTube video MP4", "public YouTube video download"],
        benefits: [
          "Choose from formats reported for the video instead of guessed presets.",
          "Use a simple browser workflow on desktop or mobile.",
          "If a source blocks processing, a direct-stream option may be available.",
        ],
        steps: ["Copy the public YouTube link.", "Paste it into the analyzer and check the available video formats.", "Select a compatible format and download the file."],
        faqs: [
          { question: "Will every YouTube video have an MP4 option?", answer: "No. Available formats depend on the source, extractor, and current platform support." },
          { question: "Can I save a private or restricted video?", answer: "No. This tool is for public content you own or are authorized to download." },
        ],
      },
      vi: {
        topic: "cong-cu-tai-video",
        slug: "tai-video-youtube-dinh-dang-mp4",
        title: "Lưu video YouTube công khai thành MP4",
        description: "Kiểm tra video có định dạng MP4 tương thích không rồi lưu nội dung công khai bạn được phép sử dụng.",
        heading: "Chọn MP4 dễ phát trên nhiều thiết bị",
        intro: "Cần lưu một đoạn video để xem khi không có mạng? Hãy kiểm tra định dạng mà link YouTube công khai thực sự cung cấp, chọn bản tương thích rồi tải nếu bạn có quyền sử dụng nội dung đó.",
        keywords: ["tải video YouTube sang MP4", "lưu video YouTube MP4", "tải video YouTube công khai"],
        benefits: [
          "Chọn theo định dạng nguồn trả về, không dùng preset đoán mò.",
          "Thao tác gọn trên trình duyệt máy tính lẫn điện thoại.",
          "Một số trường hợp có thể mở luồng trực tiếp khi xử lý bị giới hạn.",
        ],
        steps: ["Sao chép liên kết YouTube công khai.", "Dán vào công cụ và kiểm tra các định dạng video có sẵn.", "Chọn định dạng tương thích rồi lưu file."],
        faqs: [
          { question: "Video YouTube nào cũng có MP4 không?", answer: "Không. Định dạng còn tùy nguồn, extractor và mức hỗ trợ hiện tại của nền tảng." },
          { question: "Có lưu được video riêng tư hoặc bị giới hạn không?", answer: "Không. Công cụ chỉ dành cho nội dung công khai mà bạn sở hữu hoặc được cho phép tải." },
        ],
      },
      es: {
        topic: "descargar-videos",
        slug: "youtube-a-mp4-video-publico",
        title: "Guarda vídeos públicos de YouTube en MP4",
        description: "Comprueba si hay un formato de vídeo compatible y guarda únicamente contenido público que tengas permiso para usar.",
        heading: "MP4 cuando necesitas compatibilidad",
        intro: "Si quieres ver un clip sin conexión, primero consulta qué formatos ofrece ese enlace público de YouTube. Elige una opción compatible y guarda el vídeo solo si tienes autorización.",
        keywords: ["convertir YouTube a MP4 online", "guardar vídeo YouTube MP4", "descargar vídeo público YouTube"],
        benefits: [
          "Muestra formatos detectados en la fuente, no calidades inventadas.",
          "Flujo sencillo desde móvil u ordenador.",
          "En algunos casos puedes abrir el flujo directo si el procesamiento falla.",
        ],
        steps: ["Copia el enlace público de YouTube.", "Pégalo en el analizador y revisa los formatos disponibles.", "Elige un formato compatible y guarda el archivo."],
        faqs: [
          { question: "¿Todos los vídeos de YouTube tienen opción MP4?", answer: "No. Depende de la fuente, del extractor y de la compatibilidad actual de la plataforma." },
          { question: "¿Se pueden guardar vídeos privados o restringidos?", answer: "No. Solo se admite contenido público propio o autorizado." },
        ],
      },
      ja: {
        topic: "douga-download",
        slug: "youtube-koukai-douga-mp4",
        title: "公開YouTube動画をMP4で保存",
        description: "対応する動画形式が配信元にあるか確認して、利用許可のある公開動画を保存できます。",
        heading: "いろいろな端末で再生しやすいMP4を確認",
        intro: "オフラインで見たい動画があるなら、まず公開YouTubeリンクで利用できる形式を確認。端末に合うものを選び、保存の許可があるコンテンツだけをダウンロードしましょう。",
        keywords: ["YouTube MP4 保存", "YouTube 動画 ダウンロード", "公開動画 MP4 保存"],
        benefits: [
          "推測ではなく、配信元が返す形式から選べます。",
          "スマートフォンでもパソコンでも簡単に操作できます。",
          "処理できない場合、対応状況により直接再生リンクを使えます。",
        ],
        steps: ["公開YouTube動画のリンクをコピーします。", "貼り付けて利用可能な動画形式を確認します。", "対応形式を選んでファイルを保存します。"],
        faqs: [
          { question: "すべてのYouTube動画にMP4形式がありますか？", answer: "いいえ。配信元、抽出ツール、現在のプラットフォーム対応状況によって異なります。" },
          { question: "非公開や制限付きの動画も保存できますか？", answer: "できません。自分が所有する、または許可を得た公開コンテンツのみご利用ください。" },
        ],
      },
    },
  },
  {
    id: "youtube-audio",
    category: "audio",
    updatedAt: "2026-11-11",
    content: {
      en: {
        topic: "audio-tools",
        slug: "youtube-audio-for-offline-listening",
        title: "Listen offline with public video audio",
        description: "Check audio formats available from a public video and save an audio track when you have permission.",
        heading: "Keep the audio, skip the screen",
        intro: "For a talk, lesson, or recording you are allowed to keep, inspect the audio formats exposed by the source. Save a compatible track for offline listening without converting a file on your computer.",
        keywords: ["YouTube audio download", "save public video audio", "offline audio from video"],
        benefits: [
          "Review available audio formats and bitrates first.",
          "Listen offline on a compatible device or player.",
          "No desktop conversion software is needed.",
        ],
        steps: ["Copy a public video link whose audio you may save.", "Open the audio options and compare available formats.", "Choose an option and save the audio file."],
        faqs: [
          { question: "Is every video available as an audio download?", answer: "No. Audio availability depends on the source and extractor support." },
          { question: "Does this convert copyrighted music?", answer: "Use it only for media you own or are authorized to save; it does not bypass access controls." },
        ],
      },
      vi: {
        topic: "cong-cu-am-thanh",
        slug: "tai-nhac-youtube-mp3-nghe-ngoai-tuyen",
        title: "Lưu âm thanh video để nghe ngoại tuyến",
        description: "Xem nguồn có những định dạng âm thanh nào rồi lưu bản phù hợp nếu bạn có quyền sử dụng nội dung.",
        heading: "Muốn nghe thôi? Chọn phần âm thanh",
        intro: "Với bài giảng, buổi trò chuyện hay bản ghi mà bạn được phép lưu, hãy mở tùy chọn âm thanh để xem định dạng và bitrate nguồn cung cấp. Chọn bản phù hợp để nghe ngoại tuyến, không cần phần mềm chuyển đổi trên máy.",
        keywords: ["tải nhạc YouTube MP3", "tải âm thanh YouTube nghe offline", "lưu audio từ video"],
        benefits: [
          "Kiểm tra định dạng và bitrate âm thanh trước khi tải.",
          "Nghe ngoại tuyến trên thiết bị hoặc trình phát tương thích.",
          "Không cần cài phần mềm chuyển đổi máy tính.",
        ],
        steps: ["Sao chép link video công khai có phần âm thanh bạn được phép lưu.", "Mở mục âm thanh và xem các định dạng có sẵn.", "Chọn bản phù hợp rồi lưu file âm thanh."],
        faqs: [
          { question: "Video nào cũng tải được riêng âm thanh không?", answer: "Không. Còn tùy nguồn và khả năng hỗ trợ của extractor." },
          { question: "Công cụ có vượt bản quyền nhạc không?", answer: "Không. Chỉ dùng với nội dung bạn sở hữu hoặc được cho phép; công cụ không vượt cơ chế kiểm soát truy cập." },
        ],
      },
      es: {
        topic: "herramientas-de-audio",
        slug: "audio-de-videos-para-escuchar-sin-conexion",
        title: "Escucha sin conexión el audio de vídeos públicos",
        description: "Consulta los formatos de audio disponibles y guarda una pista solo si tienes permiso para hacerlo.",
        heading: "Quédate con el sonido, no con la pantalla",
        intro: "Para una clase, una charla o una grabación que puedas conservar, revisa las opciones de audio que ofrece la fuente. Elige una pista compatible y escúchala sin conexión, sin instalar un conversor en el ordenador.",
        keywords: ["descargar audio de YouTube", "audio de vídeo sin conexión", "guardar audio de vídeo público"],
        benefits: [
          "Compara formatos y bitrate antes de guardar.",
          "Escucha sin conexión en un dispositivo compatible.",
          "No necesitas instalar un conversor de escritorio.",
        ],
        steps: ["Copia el enlace de un vídeo público cuyo audio puedas guardar.", "Abre las opciones de audio y compara los formatos.", "Elige una opción y guarda el archivo de audio."],
        faqs: [
          { question: "¿Se puede extraer audio de todos los vídeos?", answer: "No. Depende de la fuente y de la compatibilidad del extractor." },
          { question: "¿Esto evita las restricciones de copyright?", answer: "No. Úsalo solo con contenido propio o autorizado; no elude controles de acceso." },
        ],
      },
      ja: {
        topic: "audio-tools",
        slug: "douga-audio-offline-kiku",
        title: "動画の音声を保存してオフラインで聴く",
        description: "公開動画で利用できる音声形式を確認し、保存の許可がある音声を端末に保存します。",
        heading: "画面を見ない時間は、音声だけ楽しむ",
        intro: "保存が許可された講義やトーク音声なら、配信元が提供する形式とビットレートを確認してみましょう。パソコン用の変換ソフトを入れずに、互換性のある音声をオフラインで聴けます。",
        keywords: ["動画 音声 保存", "YouTube 音声 ダウンロード", "音声 オフライン 再生"],
        benefits: [
          "保存前に形式とビットレートを確認できます。",
          "対応する端末やプレーヤーでオフライン再生できます。",
          "パソコンに変換ソフトを入れる必要はありません。",
        ],
        steps: ["音声の保存が許可された公開動画のリンクをコピーします。", "音声オプションを開いて利用できる形式を比べます。", "形式を選び、音声ファイルを保存します。"],
        faqs: [
          { question: "どの動画からでも音声を保存できますか？", answer: "いいえ。配信元と抽出ツールの対応状況によって異なります。" },
          { question: "著作権やアクセス制限を回避できますか？", answer: "できません。所有または許可されたコンテンツのみ利用でき、アクセス制御も回避しません。" },
        ],
      },
    },
  },
];

const curatedTranslations: Partial<Record<Locale, Record<string, LocalizedLandingContent>>> = {
  fr: {
    "public-video": {
      topic: "telecharger-videos",
      slug: "enregistrer-video-publique",
      title: "Enregistrer une vidéo publique dans le navigateur",
      description: "Vérifiez les formats proposés et enregistrez uniquement les vidéos publiques que vous êtes autorisé à conserver.",
      heading: "Gardez une vidéo utile à portée de main",
      intro: "Pour un cours, une présentation ou un trajet, collez un lien public et consultez les formats réellement proposés par la source. Choisissez un fichier adapté sans installer de logiciel sur votre ordinateur.",
      keywords: ["télécharger une vidéo publique", "enregistrer une vidéo en ligne", "vidéo hors connexion"],
      benefits: ["Consultez les formats proposés avant de choisir.", "Utilisez le navigateur sur téléphone ou ordinateur.", "Le fichier est préparé après votre choix."],
      steps: ["Copiez le lien public d’une vidéo que vous avez le droit d’enregistrer.", "Collez-le dans l’outil et vérifiez les formats disponibles.", "Choisissez un format puis enregistrez le fichier sur votre appareil."],
      faqs: [
        { question: "Puis-je enregistrer n’importe quelle vidéo en ligne ?", answer: "Non. Utilisez uniquement des contenus dont vous êtes propriétaire ou que vous êtes autorisé à enregistrer. Les contenus privés, restreints ou protégés par DRM ne sont pas pris en charge." },
        { question: "Dois-je installer une application ?", answer: "Aucune application de bureau n’est nécessaire pour vérifier les liens publics dans votre navigateur." },
      ],
    },
    "youtube-video": {
      topic: "telecharger-videos",
      slug: "video-youtube-mp4",
      title: "Enregistrer une vidéo YouTube publique en MP4",
      description: "Vérifiez si une vidéo YouTube publique propose un format compatible et enregistrez-la uniquement si vous y êtes autorisé.",
      heading: "Vérifiez les formats avant d’enregistrer",
      intro: "Collez un lien YouTube public pour consulter les formats disponibles à la source. La disponibilité dépend de la vidéo et de la configuration du service ; les contenus privés ou protégés ne sont pas pris en charge.",
      keywords: ["télécharger vidéo YouTube MP4", "enregistrer vidéo YouTube publique", "format vidéo YouTube"],
      benefits: ["Vérifiez les formats réellement proposés par la source.", "Choisissez un fichier adapté à votre appareil.", "Aucun logiciel de bureau à installer."],
      steps: ["Copiez le lien public d’une vidéo que vous êtes autorisé à enregistrer.", "Collez-le dans l’outil et consultez les formats disponibles.", "Sélectionnez un format proposé et enregistrez-le sur votre appareil."],
      faqs: [
        { question: "Toutes les vidéos YouTube sont-elles prises en charge ?", answer: "Non. La disponibilité dépend de la vidéo, de l’extracteur et des formats proposés par la source." },
        { question: "L’outil contourne-t-il les restrictions YouTube ?", answer: "Non. Les contenus privés, restreints ou protégés par DRM ne sont pas pris en charge." },
      ],
    },
    "youtube-audio": {
      topic: "outils-audio",
      slug: "audio-video-youtube-hors-ligne",
      title: "Écouter hors ligne l’audio autorisé d’une vidéo",
      description: "Consultez les formats audio proposés pour une vidéo publique et enregistrez uniquement les contenus que vous êtes autorisé à utiliser.",
      heading: "Gardez le son, même écran éteint",
      intro: "Pour un cours ou un enregistrement que vous pouvez conserver, vérifiez les options audio fournies par la source. La disponibilité dépend de la vidéo et du format ; aucun accès restreint n’est contourné.",
      keywords: ["enregistrer audio vidéo", "audio hors ligne", "audio vidéo publique"],
      benefits: ["Comparez les formats proposés avant de choisir.", "Écoutez hors ligne sur un appareil compatible.", "Aucun convertisseur de bureau nécessaire."],
      steps: ["Copiez le lien public d’une vidéo dont vous pouvez enregistrer l’audio.", "Consultez les options audio disponibles dans l’outil.", "Choisissez un format compatible et enregistrez le fichier."],
      faqs: [
        { question: "Peut-on extraire l’audio de toutes les vidéos ?", answer: "Non. Cela dépend de la source et de la compatibilité de l’extracteur." },
        { question: "Cela permet-il d’éviter les droits d’auteur ?", answer: "Non. Utilisez uniquement des contenus dont vous êtes propriétaire ou que vous êtes autorisé à enregistrer." },
      ],
    },
  },
  pt: {
    "public-video": {
      topic: "baixar-videos",
      slug: "guardar-video-publico-no-navegador",
      title: "Guarda vídeos públicos diretamente no navegador",
      description: "Consulta os formatos disponíveis e guarda apenas vídeos públicos que tens autorização para utilizar.",
      heading: "Leva contigo o vídeo de que precisas",
      intro: "Para uma aula, apresentação ou viagem, cola uma ligação pública e confirma os formatos disponibilizados pela fonte. Escolhe uma opção adequada sem instalar software no computador.",
      keywords: ["guardar vídeos públicos", "baixar vídeo online", "vídeo para ver offline"],
      benefits: ["Consulta os formatos antes de escolher.", "Usa o navegador no telemóvel ou computador.", "O ficheiro só é preparado depois da tua escolha."],
      steps: ["Copia a ligação pública de um vídeo que tenhas autorização para guardar.", "Cola-a no analisador e consulta os formatos disponíveis.", "Escolhe um formato e guarda o ficheiro no teu dispositivo."],
      faqs: [
        { question: "Posso guardar qualquer vídeo que encontro na Internet?", answer: "Não. Guarda apenas conteúdos teus ou para os quais tenhas autorização. Conteúdos privados, restritos ou protegidos por DRM não são suportados." },
        { question: "Tenho de instalar uma aplicação?", answer: "Não é necessária uma aplicação para computador; podes verificar ligações públicas no navegador." },
      ],
    },
    "youtube-video": {
      topic: "baixar-videos",
      slug: "video-youtube-publico-mp4",
      title: "Guarda um vídeo público do YouTube em MP4",
      description: "Confirma se um vídeo público do YouTube disponibiliza um formato compatível e guarda-o apenas com autorização.",
      heading: "Confirma os formatos antes de guardar",
      intro: "Cola uma ligação pública do YouTube para consultar os formatos que a fonte disponibiliza. A disponibilidade depende do vídeo e da configuração do serviço; conteúdos privados ou protegidos não são suportados.",
      keywords: ["baixar vídeo YouTube MP4", "guardar vídeo público YouTube", "formato de vídeo YouTube"],
      benefits: ["Consulta os formatos realmente fornecidos pela fonte.", "Escolhe um ficheiro adequado ao teu dispositivo.", "Não precisas de instalar software no computador."],
      steps: ["Copia a ligação pública de um vídeo que tenhas autorização para guardar.", "Cola-a na ferramenta e consulta os formatos disponíveis.", "Seleciona um formato disponível e guarda-o no teu dispositivo."],
      faqs: [
        { question: "Todos os vídeos do YouTube são suportados?", answer: "Não. A disponibilidade depende do vídeo, do extrator e dos formatos fornecidos pela fonte." },
        { question: "A ferramenta contorna restrições do YouTube?", answer: "Não. Conteúdos privados, restritos ou protegidos por DRM não são suportados." },
      ],
    },
    "youtube-audio": {
      topic: "ferramentas-audio",
      slug: "audio-de-video-youtube-offline",
      title: "Ouve offline o áudio autorizado de um vídeo",
      description: "Consulta os formatos de áudio disponíveis para um vídeo público e guarda apenas conteúdos que tenhas autorização para utilizar.",
      heading: "Fica com o áudio para ouvir quando quiseres",
      intro: "Para uma aula ou gravação que possas guardar, verifica as opções de áudio fornecidas pela fonte. A disponibilidade depende do vídeo e do formato; a ferramenta não contorna acessos restritos.",
      keywords: ["guardar áudio de vídeo", "áudio offline", "áudio de vídeo público"],
      benefits: ["Compara os formatos disponíveis antes de escolher.", "Ouve offline num dispositivo compatível.", "Não precisas de instalar um conversor no computador."],
      steps: ["Copia a ligação pública de um vídeo cujo áudio possas guardar.", "Consulta as opções de áudio disponíveis na ferramenta.", "Escolhe um formato compatível e guarda o ficheiro."],
      faqs: [
        { question: "É possível extrair áudio de todos os vídeos?", answer: "Não. Depende da fonte e da compatibilidade do extrator." },
        { question: "Isto contorna direitos de autor?", answer: "Não. Usa apenas conteúdos teus ou para os quais tenhas autorização." },
      ],
    },
  },
  ko: {
    "public-video": {
      topic: "video-download",
      slug: "gonggae-dongyeongsang-jeojang",
      title: "공개 동영상을 브라우저에서 간편하게 저장",
      description: "제공되는 형식을 확인하고 저장 권한이 있는 공개 동영상만 기기에 저장하세요.",
      heading: "필요한 동영상을 안전하게 확인하고 저장하세요",
      intro: "수업이나 발표, 이동 중에 볼 영상이 필요하신가요? 공개 링크를 붙여 넣고 출처에서 실제 제공하는 형식을 확인하세요. 별도 프로그램 설치 없이 이용할 수 있습니다.",
      keywords: ["공개 동영상 저장", "온라인 동영상 다운로드", "오프라인 동영상 보기"],
      benefits: ["저장 전에 제공 형식을 확인할 수 있습니다.", "휴대전화와 컴퓨터 브라우저에서 이용할 수 있습니다.", "형식을 선택한 뒤 파일을 준비합니다."],
      steps: ["저장 권한이 있는 공개 동영상 링크를 복사합니다.", "분석기에 붙여 넣고 사용 가능한 형식을 확인합니다.", "형식을 선택해 기기에 저장합니다."],
      faqs: [
        { question: "인터넷의 모든 동영상을 저장할 수 있나요?", answer: "아닙니다. 본인이 소유하거나 저장 허가를 받은 콘텐츠만 이용하세요. 비공개, DRM 보호 또는 접근 제한 콘텐츠는 지원하지 않습니다." },
        { question: "앱을 설치해야 하나요?", answer: "컴퓨터용 앱 설치 없이 브라우저에서 공개 링크를 확인할 수 있습니다." },
      ],
    },
    "youtube-video": {
      topic: "video-download",
      slug: "youtube-gonggae-dongyeongsang-mp4",
      title: "공개 YouTube 동영상의 MP4 형식 확인하기",
      description: "공개 YouTube 동영상이 호환 형식을 제공하는지 확인하고 저장 권한이 있는 경우에만 저장하세요.",
      heading: "저장하기 전에 제공 형식을 확인하세요",
      intro: "공개 YouTube 링크를 붙여 넣어 출처에서 제공하는 형식을 확인하세요. 사용 가능 여부는 영상과 서비스 설정에 따라 다르며 비공개 또는 보호된 콘텐츠는 지원하지 않습니다.",
      keywords: ["YouTube MP4 저장", "공개 YouTube 동영상 다운로드", "동영상 제공 형식 확인"],
      benefits: ["출처에서 실제 제공하는 형식을 확인합니다.", "기기에 맞는 파일을 선택할 수 있습니다.", "컴퓨터용 프로그램을 설치할 필요가 없습니다."],
      steps: ["저장 권한이 있는 공개 동영상 링크를 복사합니다.", "도구에 붙여 넣고 사용 가능한 형식을 확인합니다.", "제공되는 형식을 선택해 기기에 저장합니다."],
      faqs: [
        { question: "모든 YouTube 동영상을 지원하나요?", answer: "아닙니다. 영상, 추출기 호환성, 출처에서 제공하는 형식에 따라 달라집니다." },
        { question: "YouTube 접근 제한을 우회하나요?", answer: "아닙니다. 비공개, 접근 제한 또는 DRM 보호 콘텐츠는 지원하지 않습니다." },
      ],
    },
    "youtube-audio": {
      topic: "audio-tools",
      slug: "youtube-dongyeongsang-odio-offline",
      title: "허가된 동영상 오디오를 오프라인으로 듣기",
      description: "공개 동영상에서 제공되는 오디오 형식을 확인하고 이용 허가가 있는 콘텐츠만 저장하세요.",
      heading: "화면 없이도 필요한 소리를 들어보세요",
      intro: "저장 권한이 있는 강의나 녹음이라면 출처에서 제공하는 오디오 옵션을 확인하세요. 사용 가능 여부는 영상과 형식에 따라 다르며 접근 제한을 우회하지 않습니다.",
      keywords: ["동영상 오디오 저장", "오프라인 오디오", "공개 영상 오디오"],
      benefits: ["저장 전에 제공되는 오디오 형식을 확인합니다.", "호환 기기에서 오프라인으로 들을 수 있습니다.", "컴퓨터용 변환 프로그램이 필요하지 않습니다."],
      steps: ["오디오 저장 권한이 있는 공개 동영상 링크를 복사합니다.", "도구에서 사용 가능한 오디오 옵션을 확인합니다.", "호환 형식을 선택해 파일을 저장합니다."],
      faqs: [
        { question: "모든 동영상에서 오디오를 저장할 수 있나요?", answer: "아닙니다. 출처와 추출기 호환성에 따라 다릅니다." },
        { question: "저작권이나 접근 제한을 우회하나요?", answer: "아닙니다. 소유하거나 허가받은 콘텐츠만 이용하세요." },
      ],
    },
  },
};

export const LANDING_PAGES: SeoLandingPage[] = [
  ...CORE_LANDING_PAGES,
  ...createProgrammaticLandingPages(LOCALES),
];

export interface LocalizedRoute {
  locale: Locale;
  topic: string;
  slug: string;
  page: SeoLandingPage;
  content: LocalizedLandingContent;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

function getContentForPage(page: SeoLandingPage, locale: Locale): LocalizedLandingContent {
  const content = page.content[locale] ?? curatedTranslations[locale]?.[page.id];
  if (!content) throw new Error(`Missing ${locale} translation for SEO page "${page.id}".`);
  return content;
}

export function getLocalizedRoute(locale: string, topic: string, slug: string): LocalizedRoute | undefined {
  if (!isLocale(locale)) return undefined;
  for (const page of LANDING_PAGES) {
    const content = getContentForPage(page, locale);
    if (content.topic === topic && content.slug === slug) return { locale, topic, slug, page, content };
  }
  return undefined;
}

export function getLocalizedRoutes(): LocalizedRoute[] {
  return LANDING_PAGES.flatMap((page) => LOCALES.map((locale) => {
    const content = getContentForPage(page, locale);
    return { locale, topic: content.topic, slug: content.slug, page, content };
  }));
}

export function getLocalizedRoutesForLocale(locale: Locale): LocalizedRoute[] {
  return LANDING_PAGES.map((page) => {
    const content = getContentForPage(page, locale);
    return { locale, topic: content.topic, slug: content.slug, page, content };
  });
}

export function getRouteForPage(page: SeoLandingPage, locale: Locale): LocalizedRoute {
  const content = getContentForPage(page, locale);
  return { locale, topic: content.topic, slug: content.slug, page, content };
}
