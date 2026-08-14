import type { Locale } from '../i18n/ui';

export type ToolCopy = {
  name: string;
  /**
   * The complete <title>, brand included, used instead of `${name} · Utilark`.
   *
   * Ranking tool pages put the keyword first and then spend the remaining room
   * on a synonym and on "free"/"online" — `Merge PDF - Combine PDF Files for
   * Free | FoxyUtils`, `PDF 합치기 - 무료로 인터넷에서 PDF 파일 병합하기`. The
   * Korean titles also carry the spacing and synonym variants people actually
   * type, since `글자수`/`글자 수` and `사다리타기`/`사다리 게임` are separate
   * queries. Keep these under roughly 60 characters or Google truncates them.
   */
  titleTag: string;
  short: string;
  description: string;
  keywords: string[];
  intro: string[];
  steps: string[];
  faq: Array<{ question: string; answer: string }>;
};

export type ToolDefinition = {
  slug:
    | 'image-converter' | 'image-crop' | 'image-to-pdf' | 'read-aloud'
    | 'mp4-to-mp3' | 'mp4-to-gif' | 'word-counter' | 'merge-pdf' | 'ladder';
  icon: string;
  accent: string;
  copy: Record<Locale, ToolCopy>;
};

export const tools: ToolDefinition[] = [
  {
    slug: 'image-converter',
    icon: '◫',
    accent: '#ff8f70',
    copy: {
      en: {
        name: 'Image Converter',
        titleTag: 'Image Converter - JPG, PNG & WebP Free Online | Utilark',
        short: 'Convert JPG, PNG, and WebP images in your browser.',
        description:
          'Free private image converter for JPG, PNG, and WebP. Images are processed locally and never uploaded to Utilark.',
        keywords: ['image converter', 'JPG to PNG', 'PNG to WebP', 'private image converter'],
        intro: [
          'Choose one or more images and convert them to JPG, PNG, or WebP. The browser decodes and exports each image on your device.',
          'JPG does not support transparency. Transparent areas are filled with white when you choose JPG.',
        ],
        steps: [
          'Select one or more JPG, PNG, or WebP files.',
          'Choose the output format and quality.',
          'Convert and download the generated files.',
        ],
        faq: [
          {
            question: 'Are my images uploaded?',
            answer: 'No. Conversion happens locally in your browser and the selected files are not sent to Utilark.',
          },
          {
            question: 'Why did transparency turn white?',
            answer: 'The JPG format cannot store transparency, so transparent pixels are placed on a white background.',
          },
          {
            question: 'Does converting improve image quality?',
            answer: 'No. Changing formats cannot restore missing detail. A lower quality setting can make the file smaller but may reduce visual quality.',
          },
        ],
      },
      ko: {
        name: '이미지 변환기',
        titleTag: '이미지 변환 - JPG PNG WebP 무료 변환기 | Utilark',
        short: 'JPG·PNG·WebP 이미지를 브라우저에서 변환합니다.',
        description:
          'JPG, PNG, WebP 무료 이미지 변환기입니다. 이미지를 서버에 올리지 않고 사용자의 브라우저에서 처리합니다.',
        keywords: ['이미지 변환', 'JPG PNG 변환', 'PNG WebP 변환', '사진 확장자 변환'],
        intro: [
          '여러 이미지를 골라 JPG, PNG 또는 WebP로 변환할 수 있습니다. 이미지 해석과 저장 파일 생성은 사용자의 기기에서 진행됩니다.',
          'JPG는 투명 배경을 지원하지 않습니다. JPG를 선택하면 투명한 부분이 흰색으로 채워집니다.',
        ],
        steps: [
          'JPG, PNG 또는 WebP 파일을 하나 이상 선택합니다.',
          '저장 형식과 화질을 선택합니다.',
          '변환 버튼을 누르고 만들어진 파일을 내려받습니다.',
        ],
        faq: [
          {
            question: '이미지가 서버로 업로드되나요?',
            answer: '아니요. 변환은 브라우저 안에서 진행되며 선택한 파일을 Utilark로 전송하지 않습니다.',
          },
          {
            question: '투명 배경이 왜 흰색으로 바뀌었나요?',
            answer: 'JPG 형식은 투명도를 저장할 수 없어서 투명한 픽셀을 흰색 배경 위에 합성합니다.',
          },
          {
            question: '변환하면 화질이 좋아지나요?',
            answer: '아니요. 형식을 바꿔도 사라진 디테일은 복원되지 않습니다. 낮은 화질 설정은 용량을 줄이지만 선명도도 낮출 수 있습니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'image-crop',
    icon: '⊡',
    accent: '#57c7a2',
    copy: {
      en: {
        name: 'Crop Image',
        titleTag: 'Crop Image - Free Online Photo Cropper | Utilark',
        short: 'Trim a photo to the part you want, in your browser.',
        description:
          'Free online image cropper with square, 4:3, 16:9, A4, and ID photo ratios. The photo is cropped on your device and never uploaded.',
        keywords: ['crop image', 'photo cropper', 'crop picture online', 'ID photo crop'],
        intro: [
          'Drag the corners to choose the part of the picture you want to keep. Locking a ratio keeps the selection at a fixed shape, which is what you need for a profile picture, a document, or an ID photo.',
          'Cropping re-encodes the image, and that quietly strips the metadata a camera writes into a photo — including the GPS coordinates of where it was taken. That is usually a good thing to lose before sharing a picture.',
        ],
        steps: [
          'Choose one image.',
          'Pick a ratio, or leave it free, then drag the selection.',
          'Crop and download the result.',
        ],
        faq: [
          {
            question: 'Is the photo uploaded anywhere?',
            answer: 'No. The image is decoded and cropped in your browser, and the file is not sent to Utilark.',
          },
          {
            question: 'Does cropping remove the location data?',
            answer: 'Yes. The result is drawn fresh, so EXIF metadata including GPS coordinates and the camera model does not carry over.',
          },
          {
            question: 'Why does the selection jump to a neat shape?',
            answer: 'On the free setting, a selection that comes within a couple of percent of a ratio that matters — square, 4:3, 16:9, an ID photo, or the picture\'s own shape — is snapped onto it exactly, and the label at the top of the selection names it. A selection that looks square should be square. A4 only joins that list once the selection is at least 1240 pixels on its short edge, because below that the crop is too small to print at A4 and the snap would only get in the way. Pick a ratio from the menu to hold one deliberately, or switch the label off with the checkbox.',
          },
          {
            question: 'Which ID photo ratio do I need, 3:4 or 3.5:4.5?',
            answer: '3:4 is the 30 by 40 millimetre print used on Korean resumes and school records. 3.5:4.5 is the 35 by 45 millimetre print that passports and national ID cards ask for, and it is also the common size across the EU, the UK, and Japan. The tool fixes the ratio; printing at the right physical size is a separate step, and a passport office may have its own rules about the head position within the frame.',
          },
          {
            question: 'Does the picture lose quality?',
            answer: 'A PNG stays lossless. A JPG or WebP is compressed again when it is saved, so crop from the original rather than from a file you already cropped once.',
          },
        ],
      },
      ko: {
        name: '사진 자르기',
        titleTag: '사진 자르기 - 무료 온라인 이미지 크롭 | Utilark',
        short: '사진에서 원하는 부분만 브라우저에서 잘라냅니다.',
        description:
          '정사각·4:3·16:9·A4·증명사진 비율을 지원하는 무료 이미지 자르기입니다. 사진은 사용자 기기에서 처리되며 업로드되지 않습니다.',
        keywords: ['사진 자르기', '이미지 자르기', '사진 크롭', '증명사진 자르기'],
        intro: [
          '모서리를 끌어 남길 부분을 정하세요. 비율을 고정하면 선택 영역이 그 모양을 유지하기 때문에 프로필 사진, 문서, 증명사진처럼 규격이 정해진 경우에 필요합니다.',
          '자르기는 이미지를 다시 저장하는 과정이라, 카메라가 사진에 적어 넣은 메타데이터가 함께 사라집니다 — **촬영 위치 GPS 좌표도 포함됩니다.** 사진을 남에게 보내기 전이라면 대개 사라지는 편이 나은 정보입니다.',
        ],
        steps: [
          '이미지를 한 장 선택합니다.',
          '비율을 고르거나 자유로 두고 선택 영역을 끕니다.',
          '잘라서 결과를 내려받습니다.',
        ],
        faq: [
          {
            question: '사진이 어딘가로 업로드되나요?',
            answer: '아니요. 이미지 해석과 자르기는 브라우저 안에서 진행되며 파일을 Utilark로 전송하지 않습니다.',
          },
          {
            question: '자르면 위치정보도 지워지나요?',
            answer: '지워집니다. 결과물을 새로 그리기 때문에 GPS 좌표와 카메라 기종을 포함한 EXIF 메타데이터가 넘어가지 않습니다.',
          },
          {
            question: '선택 영역이 왜 저절로 딱 맞춰지나요?',
            answer: '자유 설정에서 선택 영역이 중요한 비율에 2~3% 안으로 가까워지면 정확히 그 비율로 맞춰집니다 — 정사각, 4:3, 16:9, 증명사진, 그리고 원본 사진의 비율입니다. 어떤 비율에 맞춰졌는지는 선택 영역 위쪽 표시에 함께 나옵니다. 정사각처럼 보이는 선택은 정사각이어야 하기 때문입니다. A4는 선택 영역의 짧은 변이 1240픽셀 이상일 때만 후보에 들어갑니다 — 그보다 작으면 A4로 인쇄할 해상도가 안 되기 때문에 맞춰줘도 방해만 됩니다. 비율을 고정하고 싶으면 목록에서 직접 고르고, 표시가 거슬리면 체크박스로 끄세요.',
          },
          {
            question: '증명사진은 3:4인가요 3.5:4.5인가요?',
            answer: '3:4는 30×40mm로 이력서·학생증에 붙이는 크기이고, 3.5:4.5는 35×45mm로 여권과 주민등록증에 요구하는 크기입니다. 여권 규격인 35×45mm는 EU·영국·일본에서도 같이 쓰입니다. 이 도구가 맞춰주는 것은 비율이고, 실제 크기로 인쇄하는 것과 얼굴 위치 규정은 별도로 확인하세요.',
          },
          {
            question: '화질이 떨어지나요?',
            answer: 'PNG는 무손실로 유지됩니다. JPG와 WebP는 저장할 때 다시 압축되므로, 한 번 자른 파일을 또 자르지 말고 원본에서 자르세요.',
          },
        ],
      },
    },
  },
  {
    slug: 'image-to-pdf',
    icon: '⇉',
    accent: '#ef7fa8',
    copy: {
      en: {
        name: 'Photos to PDF',
        titleTag: 'Photo to PDF - Free JPG to PDF Converter | Utilark',
        short: 'Turn photos of documents into one PDF, in order.',
        description:
          'Free photo to PDF converter. Shoot or pick images, set the order, and get one PDF — the files are never uploaded anywhere.',
        keywords: ['photo to PDF', 'JPG to PDF', 'images to PDF', 'scan document with phone'],
        intro: [
          'Photograph the pages, put them in order, and get a single PDF. On a phone the file picker offers the camera, so a document you are holding becomes a PDF without an app in between.',
          'Photos are resized before they go in. A full-resolution phone picture makes a PDF too large to email, and the screen setting is enough to read a document comfortably.',
        ],
        steps: [
          'Choose photos, or take them with the camera.',
          'Reorder the pages and pick a page size and resolution.',
          'Create the PDF and download it.',
        ],
        faq: [
          {
            question: 'Are the photos uploaded?',
            answer: 'No. They are decoded and written into the PDF inside your browser, which is worth knowing for contracts, bank letters, or an ID document.',
          },
          {
            question: 'Which resolution should I choose?',
            answer: 'The screen setting suits anything that will be read or emailed. Choose printing if the page will be printed, and full resolution only when detail matters more than file size.',
          },
          {
            question: 'What does the A4 option change?',
            answer: 'Every photo is centred on an A4 page with a margin instead of the page matching the photo. Use it when the PDF will be printed or submitted to a form expecting A4.',
          },
          {
            question: 'Can I crop the background out of a page?',
            answer: 'Crop the photos first with the image cropper, then bring the cropped files here. That removes the desk around a document, which is most of what a scanner app does.',
          },
        ],
      },
      ko: {
        name: '사진 PDF 만들기',
        titleTag: '사진 PDF 변환 - 무료 JPG PDF 만들기 | Utilark',
        short: '문서 사진을 순서대로 묶어 하나의 PDF로 만듭니다.',
        description:
          '무료 사진 PDF 변환기입니다. 사진을 찍거나 고르고 순서를 정하면 PDF 한 개가 됩니다. 파일은 어디로도 업로드되지 않습니다.',
        keywords: ['사진 PDF 변환', 'JPG PDF 변환', '이미지 PDF 만들기', '휴대폰 문서 스캔'],
        intro: [
          '페이지를 찍고 순서를 맞추면 PDF 한 개가 나옵니다. 휴대폰에서는 파일 선택이 카메라를 함께 띄우므로, 손에 든 서류를 앱 없이 바로 PDF로 만들 수 있습니다.',
          '사진은 넣기 전에 크기를 줄입니다. 원본 해상도 그대로 넣으면 메일로 보낼 수 없는 PDF가 되고, 문서를 읽는 데는 화면용 설정으로 충분합니다.',
        ],
        steps: [
          '사진을 고르거나 카메라로 찍습니다.',
          '페이지 순서를 정하고 페이지 크기와 해상도를 고릅니다.',
          'PDF를 만들고 내려받습니다.',
        ],
        faq: [
          {
            question: '사진이 업로드되나요?',
            answer: '아니요. 브라우저 안에서 해석해 PDF에 써 넣습니다. 계약서, 금융 서류, 신분증 사본을 다룰 때 의미가 있는 차이입니다.',
          },
          {
            question: '해상도는 무엇을 고르면 되나요?',
            answer: '읽거나 메일로 보낼 문서라면 화면용으로 충분합니다. 인쇄할 예정이면 인쇄용, 세부가 용량보다 중요할 때만 원본 그대로를 고르세요.',
          },
          {
            question: 'A4 선택은 무엇이 달라지나요?',
            answer: '페이지가 사진 크기를 따라가는 대신, 사진을 A4 용지 가운데에 여백을 두고 배치합니다. 인쇄하거나 A4를 요구하는 양식에 낼 때 쓰세요.',
          },
          {
            question: '문서 주변 배경을 잘라낼 수 있나요?',
            answer: '사진 자르기로 먼저 자른 뒤 그 파일을 가져오세요. 서류 주변의 책상이 사라지는데, 스캐너 앱이 하는 일의 대부분이 이것입니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'read-aloud',
    icon: '◑',
    accent: '#7a6cf0',
    copy: {
      en: {
        name: 'Read Aloud',
        titleTag: 'Read Text Aloud - Free Online Text to Speech | Utilark',
        short: 'Paste or type text and have your browser read it out.',
        description:
          'Free text to speech in your browser. Paste text, pick a voice, and listen — with on-device voices marked so you know what stays on your device.',
        keywords: ['read text aloud', 'text to speech', 'listen to PDF', 'PDF read aloud'],
        intro: [
          'Paste something you would rather listen to than read — an article, a draft you are proof-listening, a passage in a language you are learning — and the browser speaks it using the voices already installed on your device.',
          'A PDF or a Word document can be loaded straight in. **A PDF works only if its text can be selected.** A scan or a photograph of a page holds a picture rather than characters, and this tool does not run OCR, so there is nothing in such a file for it to read. Open the PDF and try to select a sentence: if the text highlights, it will be read.',
          'Voices are labelled **on device** or **network**. An on-device voice reads the text without it leaving your machine. A network voice is generated by your browser vendor, which means the text is sent to them, so the tool says so before you press play rather than after.',
        ],
        steps: [
          'Paste text, or load a PDF, a .docx, or a text file.',
          'Choose a voice — on-device voices are listed first — and set the speed.',
          'Press read aloud, and pause or stop at any time.',
        ],
        faq: [
          {
            question: 'Which PDFs can be read?',
            answer: 'Any PDF that carries a text layer, which is what you get from exporting rather than scanning. Open it and try to select a sentence: text that highlights will be read, and a page that behaves like one flat image will not. Utilark does not run OCR, so a scan is reported rather than guessed at.',
          },
          {
            question: 'Will it read the page numbers and the header?',
            answer: 'No. A running header or footer that repeats across the document is recognised by that repetition and dropped, along with page numbers, because hearing the chapter title between two sentences is worse than not hearing it at all. A two-column layout is also detected, so each column is read to its end rather than the two being read across.',
          },
          {
            question: 'Is the PDF uploaded?',
            answer: 'No. It is parsed in your browser. The one thing fetched from Utilark is a character-mapping table, and only when a PDF uses an older Korean or Japanese text encoding — that file is part of this site, and your document is not sent with the request.',
          },
          {
            question: 'Does my text get sent anywhere?',
            answer: 'Only if you choose a voice marked network, which is generated by your browser vendor rather than your device. On-device voices speak without sending anything, and they are the default here.',
          },
          {
            question: 'Why does the voice list look different on my phone?',
            answer: 'The list comes from the voices installed on your operating system, not from Utilark. Adding a voice in your system settings makes it appear here.',
          },
          {
            question: 'Why does long text play as separate pieces?',
            answer: 'Browsers cut off a single long passage partway through, so the text is split at sentence boundaries and played as a queue. It also means stopping takes effect immediately.',
          },
          {
            question: 'Does it keep reading if I switch tabs?',
            answer: 'Yes, so you can listen while doing something else. Leaving or closing the page stops it, because audio you can hear but cannot find is the one thing you cannot easily undo.',
          },
        ],
      },
      ko: {
        name: '텍스트 읽어주기',
        titleTag: '텍스트 읽어주기 - 무료 온라인 음성 변환 | Utilark',
        short: '글을 붙여 넣으면 브라우저가 소리 내어 읽어줍니다.',
        description:
          '브라우저에서 동작하는 무료 텍스트 음성 변환입니다. 글을 붙여 넣고 목소리를 고르면 읽어주며, 기기 내장 목소리를 표시해 무엇이 기기에 남는지 알 수 있습니다.',
        keywords: ['텍스트 읽어주기', '글 읽어주는 사이트', 'PDF 읽어주기', 'PDF 음성 변환'],
        intro: [
          '읽기보다 듣는 편이 나은 글을 붙여 넣으세요 — 기사, 소리 내어 확인하고 싶은 초안, 공부 중인 외국어 문장 같은 것들입니다. 기기에 이미 설치된 목소리로 읽어줍니다.',
          'PDF와 Word 문서(.docx)도 바로 올릴 수 있습니다. 다만 **PDF는 글자를 선택할 수 있는 것만 됩니다.** 스캔하거나 사진으로 찍은 PDF는 글자가 아니라 그림이고 이 도구는 OCR을 하지 않으므로, 그런 파일에는 읽을 글자 자체가 없습니다. PDF를 열어 문장을 드래그해 보세요 — 선택 영역이 잡히면 읽어줍니다.',
          '목소리에는 **기기 내장** 또는 **네트워크** 표시가 붙습니다. 기기 내장 목소리는 글이 기기 밖으로 나가지 않습니다. 네트워크 목소리는 브라우저 제조사가 만들어 보내주는 것이라 **읽는 글이 그쪽으로 전송됩니다.** 재생을 누른 뒤가 아니라 누르기 전에 알려드립니다.',
        ],
        steps: [
          '글을 붙여 넣거나 PDF·.docx·텍스트 파일을 불러옵니다.',
          '목소리를 고르고(기기 내장이 위에 옵니다) 속도를 정합니다.',
          '읽어주기를 누르고, 언제든 일시정지하거나 멈춥니다.',
        ],
        faq: [
          {
            question: '어떤 PDF를 읽을 수 있나요?',
            answer: '글자 정보가 들어 있는 PDF입니다. 문서에서 내보내기로 만든 PDF가 여기 해당하고, 스캔이나 사진으로 만든 것은 아닙니다. 파일을 열어 문장을 드래그해 보면 바로 알 수 있습니다 — 글자가 선택되면 읽어주고, 한 장의 그림처럼 통째로 잡히면 읽지 못합니다. Utilark는 OCR을 하지 않기 때문에 짐작해서 읽는 대신 읽을 수 없다고 알려드립니다.',
          },
          {
            question: '쪽 번호나 머리글도 같이 읽나요?',
            answer: '읽지 않습니다. 문서 전체에 반복되는 머리글·바닥글은 그 반복을 근거로 찾아내 쪽 번호와 함께 걸러냅니다. 문장 사이에 장 제목이 끼어드는 것보다는 아예 안 들리는 편이 낫기 때문입니다. 2단 편집도 인식해서 한 단을 끝까지 읽은 뒤 다음 단으로 넘어갑니다 — 그러지 않으면 좌우를 오가며 읽습니다.',
          },
          {
            question: 'PDF가 업로드되나요?',
            answer: '아니요. 브라우저 안에서 해석합니다. Utilark에서 받아오는 것은 글자 대응표 한 개뿐이고, 그것도 오래된 한글·일본어 인코딩을 쓴 PDF일 때만 받습니다. 그 파일은 이 사이트의 정적 자산이며 요청에 문서 내용이 실리지 않습니다.',
          },
          {
            question: '입력한 글이 어딘가로 전송되나요?',
            answer: '네트워크로 표시된 목소리를 고른 경우에만 전송됩니다. 그 목소리는 기기가 아니라 브라우저 제조사가 만들기 때문입니다. 기기 내장 목소리는 아무것도 전송하지 않으며 이 도구의 기본값입니다.',
          },
          {
            question: '기기마다 목소리 목록이 다른 이유는 무엇인가요?',
            answer: '목록은 Utilark가 아니라 사용자 운영체제에 설치된 목소리에서 옵니다. 시스템 설정에서 음성을 추가하면 여기에도 나타납니다.',
          },
          {
            question: '긴 글이 왜 나눠서 재생되나요?',
            answer: '브라우저가 한 번에 들어온 긴 발화를 도중에 끊어버리기 때문에, 문장 경계에서 나눠 차례로 읽습니다. 덕분에 멈추기도 즉시 반영됩니다.',
          },
          {
            question: '다른 탭으로 옮겨도 계속 읽나요?',
            answer: '계속 읽습니다. 다른 일을 하면서 들으라고 만든 기능입니다. 다만 페이지를 벗어나거나 닫으면 멈춥니다 — 소리는 들리는데 어디서 나는지 못 찾는 상황이 되돌리기 가장 어렵기 때문입니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'word-counter',
    icon: 'Aa',
    accent: '#76b8ff',
    copy: {
      en: {
        name: 'Word & Character Counter',
        titleTag: 'Word Counter - Free Online Character & Byte Count | Utilark',
        short: 'Count words, characters, lines, and UTF-8 bytes instantly.',
        description:
          'Free online word and character counter with line and UTF-8 byte counts. Text stays in your browser and is never uploaded.',
        keywords: ['word counter', 'character counter', 'byte counter', 'docx word count'],
        intro: [
          'Paste or type text to see live counts for words, characters, characters without spaces, lines, and UTF-8 bytes.',
          'A Word document can be loaded straight from your computer. It is unzipped and read in the browser, so the file goes no further than the page you are on.',
        ],
        steps: [
          'Paste text, or load a .docx or text file.',
          'Read the counts as they update instantly.',
          'Clear or copy the text when you are done.',
        ],
        faq: [
          {
            question: 'Can I count a Word document?',
            answer: 'Yes. Pick a .docx file or drop it on the box and its text loads into the editor. A .docx is a ZIP of XML, and the browser can already unzip and read it, so nothing is uploaded and no extra software is needed. The older binary .doc format cannot be read — open it in Word and save it as .docx first.',
          },
          {
            question: 'Which parts of a Word file are counted?',
            answer: 'The body you wrote, including tables and text boxes. Headers, footers, footnotes and comments live in separate parts of the file and are left out, as is text you deleted with track changes turned on and any field code such as an automatic page number.',
          },
          {
            question: 'What counts as a word?',
            answer: 'Utilark uses the browser’s language-aware word segmentation when supported. Older browsers fall back to groups separated by whitespace.',
          },
          {
            question: 'What does UTF-8 bytes mean?',
            answer: 'It is the storage size of the text when encoded as UTF-8. Korean characters usually use more bytes than basic Latin letters.',
          },
          {
            question: 'Is the text saved?',
            answer: 'No. The counter runs in your browser and does not send or save the text on Utilark servers.',
          },
        ],
      },
      ko: {
        name: '글자수·단어수 계산기',
        titleTag: '글자수 세기 - 무료 글자 수 단어수 바이트 계산 | Utilark',
        short: '글자, 단어, 줄, UTF-8 바이트 수를 바로 계산합니다.',
        description:
          '공백 포함·제외 글자수, 단어수, 줄 수와 UTF-8 바이트를 계산합니다. 입력한 글은 브라우저 밖으로 전송하지 않습니다.',
        keywords: ['글자수 세기', '단어수 계산', '공백 제외 글자수', 'docx 글자수'],
        intro: [
          '글을 붙여 넣거나 입력하면 단어수, 공백 포함·제외 글자수, 줄 수, UTF-8 바이트가 실시간으로 표시됩니다.',
          'Word 문서(.docx)를 그대로 올려도 됩니다. 브라우저 안에서 압축을 풀고 읽기 때문에 파일이 이 페이지 밖으로 나가지 않습니다.',
        ],
        steps: [
          '글을 붙여 넣거나 .docx·텍스트 파일을 불러옵니다.',
          '실시간으로 바뀌는 계산 결과를 확인합니다.',
          '작업을 마치면 복사하거나 입력창을 비웁니다.',
        ],
        faq: [
          {
            question: 'Word 문서(.docx) 글자수도 셀 수 있나요?',
            answer: '됩니다. 파일을 고르거나 입력창에 끌어다 놓으면 본문이 그대로 들어옵니다. .docx는 XML을 압축해 둔 ZIP 파일이고 브라우저가 압축 해제와 읽기를 이미 할 수 있어서, 업로드도 별도 프로그램 설치도 필요 없습니다. 옛 형식인 .doc는 읽지 못하니 Word에서 .docx로 저장한 뒤 올려 주세요.',
          },
          {
            question: 'Word 파일의 어디까지 세나요?',
            answer: '직접 쓴 본문이며 표와 텍스트 상자 안의 글도 포함합니다. 머리글·바닥글·각주·메모는 파일 안에서 별도 영역에 저장되므로 세지 않고, 변경 내용 추적으로 지운 글과 자동 쪽 번호 같은 필드 코드도 빼고 셉니다. 자기소개서 글자수를 확인할 때 필요한 것은 본문이기 때문입니다.',
          },
          {
            question: '단어는 어떤 기준으로 계산하나요?',
            answer: '브라우저가 지원하면 언어별 단어 분리 기능을 사용합니다. 오래된 브라우저에서는 공백으로 나뉜 묶음을 단어로 셉니다.',
          },
          {
            question: 'UTF-8 바이트는 무엇인가요?',
            answer: '글을 UTF-8 방식으로 저장할 때 필요한 데이터 크기입니다. 한글은 일반적인 영문자보다 한 글자에 더 많은 바이트를 사용합니다.',
          },
          {
            question: '입력한 글이 저장되나요?',
            answer: '아니요. 계산은 브라우저 안에서만 진행되며 Utilark 서버로 글을 보내거나 저장하지 않습니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'merge-pdf',
    icon: 'PDF',
    accent: '#9c88ff',
    copy: {
      en: {
        name: 'Merge PDF',
        titleTag: 'Merge PDF - Combine PDF Files Free Online | Utilark',
        short: 'Combine multiple PDF files without uploading them.',
        description:
          'Merge PDF files privately in your browser. Reorder files, combine every page, and download one PDF without uploading documents.',
        keywords: ['merge PDF', 'combine PDF files', 'private PDF merger', 'PDF joiner'],
        intro: [
          'Combine multiple PDF files into one document. Files are merged in the order shown, and you can move them before creating the result.',
          'Processing happens locally. Large or encrypted PDFs may be limited by your device memory or may not open.',
        ],
        steps: [
          'Select two or more PDF files.',
          'Move files up or down to set the page order.',
          'Merge and download the combined PDF.',
        ],
        faq: [
          {
            question: 'Are PDF files uploaded?',
            answer: 'No. The files are read and combined in your browser and are not uploaded to Utilark.',
          },
          {
            question: 'Can I merge password-protected PDFs?',
            answer: 'Encrypted or password-protected PDFs are not supported in this initial version. Remove the protection with an authorized tool first.',
          },
          {
            question: 'Why does a very large PDF fail?',
            answer: 'Browser processing uses your device memory. Try fewer files at a time or use a desktop device with more available memory.',
          },
        ],
      },
      ko: {
        name: 'PDF 합치기',
        titleTag: 'PDF 합치기 - 무료 온라인 PDF 병합 | Utilark',
        short: 'PDF를 업로드하지 않고 하나의 파일로 합칩니다.',
        description:
          '여러 PDF 파일을 브라우저에서 안전하게 합칩니다. 문서를 서버에 업로드하지 않고 순서를 바꿔 하나의 PDF로 저장하세요.',
        keywords: ['PDF 합치기', 'PDF 병합', 'PDF 파일 합치기', 'PDF 순서 변경'],
        intro: [
          '여러 PDF 파일을 표시된 순서대로 하나의 문서로 합칩니다. 결과를 만들기 전에 파일 순서를 위아래로 변경할 수 있습니다.',
          '모든 처리는 브라우저에서 진행됩니다. 아주 큰 파일은 기기 메모리에 따라 제한될 수 있고 암호화된 PDF는 열리지 않을 수 있습니다.',
        ],
        steps: [
          'PDF 파일을 두 개 이상 선택합니다.',
          '위·아래 버튼으로 파일과 페이지 묶음의 순서를 정합니다.',
          '합치기 버튼을 누르고 완성된 PDF를 내려받습니다.',
        ],
        faq: [
          {
            question: 'PDF 파일이 서버로 업로드되나요?',
            answer: '아니요. 파일 읽기와 병합은 브라우저 안에서 진행되며 Utilark로 문서를 전송하지 않습니다.',
          },
          {
            question: '암호가 걸린 PDF도 합칠 수 있나요?',
            answer: '초기 버전에서는 암호화되거나 비밀번호로 보호된 PDF를 지원하지 않습니다. 권한이 있는 도구로 보호를 해제한 뒤 사용하세요.',
          },
          {
            question: '용량이 큰 PDF가 실패하는 이유는 무엇인가요?',
            answer: '브라우저 처리는 기기의 메모리를 사용합니다. 파일 수를 나눠 처리하거나 메모리 여유가 있는 데스크톱 기기를 이용해보세요.',
          },
        ],
      },
    },
  },
  {
    slug: 'mp4-to-mp3',
    icon: '♪',
    accent: '#ffb347',
    copy: {
      en: {
        name: 'MP4 to MP3',
        titleTag: 'MP4 to MP3 - Free Online Video to Audio, No Upload | Utilark',
        short: 'Take the sound out of a video and save it as an MP3.',
        description:
          'Free MP4 to MP3 converter that runs in your browser. Extract audio from a video without uploading it — the file never leaves your device.',
        keywords: ['MP4 to MP3', 'video to audio', 'extract audio from video', 'convert video to MP3'],
        intro: [
          'Pick a video and keep only its sound. A lecture recording you want on your phone, a song from a video, a podcast someone sent you as an MP4 — the picture is dropped and the audio is written as an MP3.',
          'This matters more here than with a photo. **A video is the largest file most people ever convert**, and every other converter for this job asks you to upload it and wait. Here the browser decodes the sound and writes the MP3 on your own machine, so there is no upload, no queue, and no copy of your recording on someone else\'s server.',
          'The decoding is done by the same codecs your browser uses to play the file, which means anything that plays will convert. A browser shipped without the MP4 audio licence — some Linux builds — cannot open AAC, and the tool says so rather than producing silence.',
        ],
        steps: [
          'Choose a video file.',
          'Pick a quality; the estimated size updates as you do.',
          'Save as MP3.',
        ],
        faq: [
          {
            question: 'Is my video uploaded?',
            answer: 'No. It is decoded and re-encoded in your browser, which is the point — a video is a big file, and uploading one to a converter means handing over a full copy of whatever you recorded. Nothing is sent to Utilark.',
          },
          {
            question: 'Does converting improve the sound?',
            answer: 'No, and nothing can. The audio in an MP4 is already compressed, usually as AAC, and writing it out as MP3 compresses it a second time. Choose a higher bitrate to lose less; 192 kbps is a reasonable default and 320 kbps is as close to the source as MP3 goes.',
          },
          {
            question: 'How long a video can it handle?',
            answer: 'The whole track is decoded into memory at once, so the limit is your device\'s, not a policy. Roughly twenty minutes of stereo, or twice that in mono; the tool works out the figure for your file and shows it. A longer recording is reported rather than attempted.',
          },
          {
            question: 'Which formats work?',
            answer: 'Whatever your browser can play, which covers MP4, MOV, WebM, M4A and more. It works on audio files too, so an M4A voice memo can become an MP3 the same way.',
          },
        ],
      },
      ko: {
        name: 'MP4를 MP3로',
        titleTag: 'MP4 MP3 변환 - 무료 동영상 소리 추출, 업로드 없음 | Utilark',
        short: '동영상에서 소리만 뽑아 MP3로 저장합니다.',
        description:
          '브라우저에서 동작하는 무료 MP4 MP3 변환입니다. 동영상을 업로드하지 않고 소리만 추출하며, 파일이 기기 밖으로 나가지 않습니다.',
        keywords: ['MP4 MP3 변환', '동영상 음원 추출', '영상 소리 추출', 'mp4 음성 추출'],
        intro: [
          '동영상을 고르면 소리만 남깁니다. 휴대폰에 넣어 두고 들을 강의 녹화, 영상 속 노래, MP4로 받은 팟캐스트 같은 것들입니다. 화면은 버리고 소리를 MP3로 씁니다.',
          '이 도구에서는 업로드 여부가 사진보다 훨씬 중요합니다. **동영상은 사람들이 변환하는 파일 중 가장 큽니다.** 다른 변환 사이트는 전부 그 큰 파일을 올리고 기다리라고 합니다. 여기서는 브라우저가 사용자 기기에서 직접 해석하고 씁니다 — 업로드도, 대기열도, 남의 서버에 남는 녹화본 사본도 없습니다.',
          '해석은 브라우저가 그 파일을 재생할 때 쓰는 코덱이 그대로 합니다. 즉 **재생되는 파일이면 변환됩니다.** MP4 소리(AAC) 라이선스 없이 배포된 브라우저(일부 리눅스용)는 열지 못하는데, 그럴 때는 조용한 파일을 만드는 대신 안 된다고 알려드립니다.',
        ],
        steps: [
          '동영상 파일을 고릅니다.',
          '음질을 정하면 예상 크기가 함께 바뀝니다.',
          'MP3로 저장합니다.',
        ],
        faq: [
          {
            question: '동영상이 업로드되나요?',
            answer: '아니요. 브라우저 안에서 해석하고 다시 씁니다. 이 도구의 핵심이 그것입니다 — 동영상은 큰 파일이고, 변환 사이트에 올린다는 것은 찍어 둔 것의 완전한 사본을 넘긴다는 뜻입니다. Utilark로는 아무것도 전송되지 않습니다.',
          },
          {
            question: '변환하면 음질이 좋아지나요?',
            answer: '좋아지지 않고, 어떤 방법으로도 좋아질 수 없습니다. MP4 안의 소리는 이미 압축된 것(보통 AAC)이고, MP3로 쓰면 두 번째 압축이 됩니다. 덜 잃으려면 높은 비트레이트를 고르세요. 192kbps면 무난하고, 320kbps가 MP3로 원본에 가장 가깝게 가는 선입니다.',
          },
          {
            question: '얼마나 긴 영상까지 되나요?',
            answer: '소리 전체를 메모리에 한 번에 펼치기 때문에 한계는 정책이 아니라 기기 사양입니다. 스테레오 기준 대략 20분, 모노면 그 두 배입니다. 고른 파일에 맞는 수치를 도구가 계산해 보여주고, 그보다 길면 시도하지 않고 알려드립니다.',
          },
          {
            question: '어떤 형식이 되나요?',
            answer: '브라우저가 재생할 수 있는 것이면 됩니다. MP4·MOV·WebM·M4A 등이 여기 들어갑니다. 소리 파일에도 그대로 동작하므로 M4A 음성 메모를 MP3로 바꾸는 데도 쓸 수 있습니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'mp4-to-gif',
    icon: '▷',
    accent: '#5ecfd6',
    copy: {
      en: {
        name: 'MP4 to GIF',
        titleTag: 'MP4 to GIF - Free Online Video to GIF, No Upload | Utilark',
        short: 'Turn a few seconds of video into an animated GIF.',
        description:
          'Free MP4 to GIF converter that runs in your browser. Pick the seconds you want, set the size and frame rate, and download — no upload.',
        keywords: ['MP4 to GIF', 'video to GIF', 'make a GIF from a video', 'convert video to GIF'],
        intro: [
          'Scrub to the part worth repeating, mark the start and the end, and save it as a GIF. The video is played and captured on your own machine, so nothing is uploaded and there is no wait for a queue.',
          '**A GIF has no video compression.** It stores a complete palette-mapped picture for every frame, which is why a few seconds can outweigh the video it came from. The tool shows the estimated size before it starts, and the three dials that matter — length, width and frame rate — are all in front of you.',
          'GIF also holds only 256 colours per frame. A single palette is built for the whole clip rather than one per frame, because per-frame palettes make the colours crawl under a still background.',
        ],
        steps: [
          'Choose a video and scrub to the part you want.',
          'Mark the start and the end, then set the width and frame rate.',
          'Save as GIF.',
        ],
        faq: [
          {
            question: 'Why is my GIF so much bigger than the video?',
            answer: 'Because a GIF has no motion compression. A video stores what changed between frames; a GIF stores every frame whole. Ten seconds at 480 pixels and 10 frames per second is over a hundred full pictures. Shorten the range first, then reduce the width, then lower the frame rate — in that order, for the largest saving with the least visible loss.',
          },
          {
            question: 'Why do the colours look flat?',
            answer: 'A GIF frame can hold 256 colours, so a gradient or a film shot has to be approximated. That is the format, not the conversion. If the colours matter more than the autoplay, a short MP4 is the better file to share.',
          },
          {
            question: 'Is my video uploaded?',
            answer: 'No. The frames are drawn on a canvas in your browser and encoded there. Nothing is sent to Utilark.',
          },
          {
            question: 'Is there a length limit?',
            answer: 'The GIF is capped at 600 frames, which is a minute at 10 frames per second and half that at 20. Long before that limit the file becomes too big to send anywhere, which is the real constraint.',
          },
        ],
      },
      ko: {
        name: 'MP4를 GIF로',
        titleTag: 'MP4 GIF 변환 - 무료 동영상 GIF 만들기, 업로드 없음 | Utilark',
        short: '동영상의 몇 초를 움직이는 GIF로 만듭니다.',
        description:
          '브라우저에서 동작하는 무료 MP4 GIF 변환입니다. 원하는 구간을 고르고 크기와 초당 장수를 정해 내려받으세요. 업로드하지 않습니다.',
        keywords: ['MP4 GIF 변환', '동영상 gif 만들기', '영상 움짤 만들기', 'gif 변환 사이트'],
        intro: [
          '반복해서 볼 만한 부분으로 재생 위치를 옮기고, 시작과 끝을 찍어 GIF로 저장하세요. 재생과 캡처가 모두 사용자 기기에서 일어나므로 업로드도 대기열도 없습니다.',
          '**GIF에는 동영상 압축이 없습니다.** 장면마다 완성된 그림을 통째로 담기 때문에, 몇 초짜리가 원본 영상보다 커지는 일이 흔합니다. 그래서 시작 전에 예상 크기를 보여주고, 크기를 좌우하는 세 가지(길이·가로 크기·초당 장수)를 모두 앞에 꺼내 두었습니다.',
          'GIF는 한 장면에 색을 256개까지만 담습니다. 장면마다 색을 따로 고르면 가만히 있는 배경의 색이 계속 흔들려 보이기 때문에, 구간 전체에 하나의 색표를 만들어 씁니다.',
        ],
        steps: [
          '동영상을 고르고 원하는 지점으로 재생 위치를 옮깁니다.',
          '시작과 끝을 찍고 가로 크기와 초당 장수를 정합니다.',
          'GIF로 저장합니다.',
        ],
        faq: [
          {
            question: 'GIF가 원본 영상보다 큰 이유가 무엇인가요?',
            answer: 'GIF에는 움직임 압축이 없기 때문입니다. 동영상은 이전 장면에서 바뀐 부분만 저장하지만 GIF는 매 장면을 통째로 저장합니다. 가로 480px에 초당 10장으로 10초면 완성된 그림이 100장이 넘습니다. 줄이려면 구간을 짧게 → 가로 크기를 작게 → 초당 장수를 낮추는 순서가 좋습니다. 눈에 덜 띄면서 가장 많이 줄어듭니다.',
          },
          {
            question: '색이 왜 밋밋해 보이나요?',
            answer: 'GIF 한 장면에 들어가는 색이 256개까지라, 그라데이션이나 영화 장면은 근사치로 바꿔 담을 수밖에 없습니다. 변환 문제가 아니라 형식의 성질입니다. 자동 재생보다 색이 중요하다면 짧은 MP4를 그대로 보내는 편이 낫습니다.',
          },
          {
            question: '동영상이 업로드되나요?',
            answer: '아니요. 장면을 브라우저 안의 캔버스에 그리고 거기서 인코딩합니다. Utilark로 전송되는 것은 없습니다.',
          },
          {
            question: '길이 제한이 있나요?',
            answer: '최대 600장까지 담습니다. 초당 10장이면 1분, 20장이면 30초입니다. 다만 그 한계에 닿기 한참 전에 파일이 어디로도 보내기 어려운 크기가 되므로, 실질적인 제한은 그쪽입니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'ladder',
    icon: '⋕',
    accent: '#e0a11f',
    copy: {
      en: {
        name: 'Ladder Game',
        titleTag: 'Ladder Game - Free Online Ghost Leg Picker | Utilark',
        short: 'Assign outcomes to people with a random ladder.',
        description:
          'Free ladder game for deciding who gets what. Enter names and outcomes, build a random ladder, and trace each line in your browser.',
        keywords: ['ladder game', 'ghost leg', 'amidakuji', 'random assignment'],
        intro: [
          'Write the names along the top and the outcomes along the bottom, then build a ladder. Tapping a name traces the line down so everyone can watch the path instead of trusting a number generator.',
          'The ladder is drawn so that no two rungs sit side by side on the same row, which keeps every branch a real choice, and so that every gap between columns is used at least once, which stops a line from dropping straight to its own starting slot.',
          'Useful for settling who buys coffee, picking a presentation order, or splitting chores.',
        ],
        steps: [
          'Set the number of people, from two to eight.',
          'Type the names on top and the outcomes below, or use one of the quick fills.',
          'Build the ladder, then tap a name to trace that line.',
          'Reveal the rest, or build a new ladder to start over.',
        ],
        faq: [
          {
            question: 'Is the result actually random?',
            answer: 'The rungs are placed with the browser\'s random number generator each time you build. Nothing about the order of names changes the odds.',
          },
          {
            question: 'Can two people land on the same outcome?',
            answer: 'No. A ladder is a one-to-one mapping, so each outcome is reached by exactly one line. That is the property that makes it useful for assigning chores or an order.',
          },
          {
            question: 'Are the names saved?',
            answer: 'No. Names and outcomes stay in the page and are cleared when you close or refresh it.',
          },
          {
            question: 'Why did the ladder redraw when I rotated my phone?',
            answer: 'The drawing is measured from the width available, so a rotation recomputes the coordinates. Traces you already revealed are drawn again in place.',
          },
        ],
      },
      ko: {
        name: '사다리타기',
        titleTag: '사다리타기 - 무료 온라인 사다리 게임 | Utilark',
        short: '무작위 사다리로 사람과 결과를 이어줍니다.',
        description:
          '이름과 결과를 적고 무작위 사다리를 만드는 무료 사다리타기입니다. 이름을 누르면 브라우저에서 선을 따라 내려가는 경로를 그려줍니다.',
        keywords: ['사다리타기', '사다리 게임', '순서 정하기', '내기 정하기'],
        intro: [
          '위에는 이름, 아래에는 결과를 적고 사다리를 만드세요. 이름을 누르면 선이 내려가는 경로를 그려주기 때문에, 숫자만 툭 나오는 방식과 달리 결과가 어떻게 정해졌는지 다 같이 볼 수 있습니다.',
          '같은 줄에 가로칸이 나란히 붙지 않도록 놓아 갈림길이 항상 진짜 선택이 되게 하고, 열 사이 간격을 최소 한 번씩 쓰게 해서 어떤 줄도 제자리로 내려오지 않게 만듭니다.',
          '커피 내기, 발표 순서 정하기, 집안일 나누기에 쓰기 좋습니다.',
        ],
        steps: [
          '인원을 2명에서 8명 사이로 정합니다.',
          '위에 이름, 아래에 결과를 적거나 빠른 채우기 버튼을 누릅니다.',
          '사다리를 만든 뒤 이름을 눌러 경로를 확인합니다.',
          '전체 보기로 나머지를 확인하거나 다시 만들어 새로 시작합니다.',
        ],
        faq: [
          {
            question: '결과가 정말 무작위인가요?',
            answer: '사다리를 만들 때마다 브라우저의 난수로 가로칸을 새로 놓습니다. 이름을 어떤 순서로 적든 확률은 달라지지 않습니다.',
          },
          {
            question: '두 사람이 같은 결과에 걸릴 수 있나요?',
            answer: '아니요. 사다리는 일대일로 이어지므로 각 결과에는 정확히 한 줄만 도착합니다. 순서를 정하거나 역할을 나눌 때 사다리를 쓰는 이유가 바로 이 성질입니다.',
          },
          {
            question: '입력한 이름이 저장되나요?',
            answer: '아니요. 이름과 결과는 페이지 안에만 있고 닫거나 새로고침하면 사라집니다.',
          },
          {
            question: '휴대폰을 돌렸더니 사다리를 다시 그리는데 왜 그런가요?',
            answer: '화면 폭을 재서 좌표를 잡기 때문에 회전하면 다시 계산합니다. 이미 확인한 경로는 같은 자리에 다시 그려집니다.',
          },
        ],
      },
    },
  },
];

export const getTool = (slug: string): ToolDefinition | undefined =>
  tools.find((tool) => tool.slug === slug);
