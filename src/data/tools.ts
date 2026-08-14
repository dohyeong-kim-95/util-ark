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
  slug: 'image-converter' | 'image-crop' | 'word-counter' | 'merge-pdf' | 'ladder';
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
            question: 'Why is the ID photo ratio 3.5:4.5?',
            answer: 'That is the 35 by 45 millimetre shape used for Korean ID and passport photographs. The ratio is what the tool fixes; printing at the right size is a separate step.',
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
            question: '증명사진 비율이 왜 3.5:4.5인가요?',
            answer: '국내 증명사진·여권사진에 쓰는 35×45mm 규격의 비율입니다. 이 도구가 맞춰주는 것은 비율이고, 실제 크기로 인쇄하는 것은 별도 작업입니다.',
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
        keywords: ['word counter', 'character counter', 'byte counter', 'online text counter'],
        intro: [
          'Paste or type text to see live counts for words, characters, characters without spaces, lines, and UTF-8 bytes.',
          'Word boundaries use the browser’s language-aware segmenter when available, with a whitespace-based fallback.',
        ],
        steps: [
          'Paste or type text in the editor.',
          'Read the counts as they update instantly.',
          'Clear or copy the text when you are done.',
        ],
        faq: [
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
        keywords: ['글자수 세기', '단어수 계산', '바이트 계산기', '공백 제외 글자수'],
        intro: [
          '글을 붙여 넣거나 입력하면 단어수, 공백 포함·제외 글자수, 줄 수, UTF-8 바이트가 실시간으로 표시됩니다.',
          '가능한 브라우저에서는 언어별 단어 경계를 인식하고, 지원하지 않으면 공백을 기준으로 계산합니다.',
        ],
        steps: [
          '입력창에 글을 붙여 넣거나 직접 작성합니다.',
          '실시간으로 바뀌는 계산 결과를 확인합니다.',
          '작업을 마치면 복사하거나 입력창을 비웁니다.',
        ],
        faq: [
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
