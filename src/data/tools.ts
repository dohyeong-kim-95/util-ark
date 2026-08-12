import type { Locale } from '../i18n/ui';

export type ToolCopy = {
  name: string;
  short: string;
  description: string;
  keywords: string[];
  intro: string[];
  steps: string[];
  faq: Array<{ question: string; answer: string }>;
};

export type ToolDefinition = {
  slug: 'image-converter' | 'word-counter' | 'merge-pdf';
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
    slug: 'word-counter',
    icon: 'Aa',
    accent: '#76b8ff',
    copy: {
      en: {
        name: 'Word & Character Counter',
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
];

export const getTool = (slug: string): ToolDefinition | undefined =>
  tools.find((tool) => tool.slug === slug);
