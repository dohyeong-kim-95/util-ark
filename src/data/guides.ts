import type { Locale } from '../i18n/ui';
import type { ToolDefinition } from './tools';

export type GuideCopy = {
  title: string;
  /** Complete <title> including the brand. Same rule as ToolCopy.titleTag. */
  titleTag: string;
  description: string;
  intro: string[];
  sections: Array<{ heading: string; paragraphs?: string[]; list?: string[] }>;
  /** Sentence that leads into the tool this guide supports. */
  toolCta: string;
};

export type GuideDefinition = {
  slug: string;
  /** The tool this guide is about. Links run both ways. */
  tool: ToolDefinition['slug'];
  updated: string;
  copy: Record<Locale, GuideCopy>;
};

/**
 * Guides carry the depth a tool page cannot: a tool page has to stay usable at
 * a glance, so it cannot answer why a job application counts bytes or when a
 * format change is pointless. Sites that rank for these keywords cover one
 * topic across a tool page, a help article, and a longer post rather than
 * padding the tool page — see docs/seo-research.md.
 */
export const guides: GuideDefinition[] = [
  {
    slug: 'korean-application-character-count',
    tool: 'word-counter',
    updated: '2026-08-13',
    copy: {
      en: {
        title: 'Counting characters for an application form',
        titleTag: 'Character Count for Applications - Free Guide | Utilark',
        description:
          'Why application forms disagree about your character count, how spaces and line breaks are treated, and when a limit is measured in bytes instead of characters.',
        intro: [
          'You paste an essay into an application form and it reports a different number than the counter you just used. Neither is broken. They are almost always measuring different things.',
          'There are three questions to settle before you trust any count: whether spaces are included, whether line breaks are counted, and whether the limit is in characters or in bytes.',
        ],
        sections: [
          {
            heading: 'Spaces are the usual disagreement',
            paragraphs: [
              'Most forms state a limit "including spaces", but plenty state it without, and some do not say at all. The gap between the two is large — roughly a sixth of a typical paragraph is spaces.',
              'Write to the smaller number when a form is unclear. Being under a limit costs you nothing, while being over usually means the form truncates your text silently at submission.',
            ],
          },
          {
            heading: 'Line breaks are counted, and they are invisible',
            paragraphs: [
              'A line break is a character. Some systems store it as one character, others as two, and none of them show it to you. If you are near a limit and cannot account for the difference, your paragraph breaks are a likely explanation.',
              'This is also why text pasted from a word processor can suddenly run long. Soft wrapping in the editor becomes hard line breaks when it lands in a plain text field.',
            ],
          },
          {
            heading: 'When the limit is in bytes',
            paragraphs: [
              'Some forms — public sector applications in particular — limit the field by storage size rather than by character count. This matters enormously for languages outside the basic Latin alphabet.',
              'In UTF-8, a plain Latin letter takes one byte while a Korean syllable takes three. A 300-byte field holds 300 English letters but only 100 Korean characters. If a limit looks strangely small for the text you are writing, it is probably a byte limit.',
              'Older systems may use a different encoding where a Korean syllable takes two bytes instead of three, so a byte limit is only meaningful once you know which encoding the form uses. When the form does not say, treat the UTF-8 figure as the cautious one — it is the larger of the two.',
            ],
          },
          {
            heading: 'Check against the form itself before you submit',
            paragraphs: [
              'No external counter can know a particular form\'s rules. Use one to draft and to get close, then paste into the real field and read whatever number the form shows you. That number is the one that decides whether your text is accepted.',
              'Leave a margin of a few percent. Forms that trim trailing whitespace, normalize quotation marks, or convert line endings can shift the count between your draft and the submission.',
            ],
          },
          {
            heading: 'Why the counter here does not upload your draft',
            paragraphs: [
              'An application essay is personal writing, often naming your employer, your history, and your circumstances. It should not need to travel to a server to be counted.',
              'The counter on this site runs in your browser. The text stays in the page and is gone when you close it.',
            ],
          },
        ],
        toolCta: 'Count words, characters with and without spaces, lines, and UTF-8 bytes at once:',
      },
      ko: {
        title: '자기소개서 글자수 세는 법',
        titleTag: '자소서 글자수 세는 법 - 무료 가이드 | Utilark',
        description:
          '입사지원서 양식과 글자수 계산기의 숫자가 다른 이유, 공백과 줄바꿈 처리 기준, 그리고 글자 수가 아니라 바이트로 제한하는 경우를 정리했습니다.',
        intro: [
          '자소서를 지원 양식에 붙여 넣었더니 방금 센 글자 수와 다르게 나옵니다. 어느 쪽이 고장 난 게 아니라, 대개 서로 다른 것을 세고 있습니다.',
          '어떤 계산기를 믿기 전에 세 가지를 먼저 정해야 합니다. 공백을 포함하는지, 줄바꿈을 세는지, 그리고 제한이 글자 수인지 바이트인지입니다.',
        ],
        sections: [
          {
            heading: '가장 흔한 차이는 공백입니다',
            paragraphs: [
              '대부분의 양식이 "공백 포함"으로 제한을 걸지만 공백 제외로 적는 곳도 많고, 아예 밝히지 않는 곳도 있습니다. 둘의 차이는 작지 않습니다 — 보통 한 문단의 6분의 1 정도가 공백입니다.',
              '양식이 애매하면 **작은 쪽에 맞춰 쓰세요.** 제한보다 짧아서 손해 볼 일은 없지만, 넘치면 제출 시점에 뒤가 조용히 잘리는 경우가 많습니다.',
            ],
          },
          {
            heading: '줄바꿈도 글자이고, 눈에 보이지 않습니다',
            paragraphs: [
              '줄바꿈은 글자입니다. 어떤 시스템은 한 글자로, 어떤 시스템은 두 글자로 저장하며, 어느 쪽도 화면에 보여주지 않습니다. 제한에 아슬아슬한데 숫자 차이가 설명되지 않는다면 문단 사이의 줄바꿈이 유력한 원인입니다.',
              '한글이나 워드에서 복사한 글이 갑자기 길어지는 이유도 같습니다. 편집기에서 자동으로 접혀 있던 줄이 일반 입력칸에 들어가면서 실제 줄바꿈으로 바뀝니다.',
            ],
          },
          {
            heading: '바이트로 제한하는 양식',
            paragraphs: [
              '일부 양식 — 특히 공공기관 지원서 — 은 글자 수가 아니라 저장 용량으로 칸을 제한합니다. 한글에는 이게 결정적입니다.',
              'UTF-8에서 영문자 한 글자는 1바이트지만 **한글 한 글자는 3바이트**입니다. 300바이트 칸에는 영문 300자가 들어가지만 한글은 100자밖에 못 들어갑니다. 쓰려는 분량에 비해 제한이 이상하게 작아 보인다면 바이트 제한일 가능성이 높습니다.',
              '오래된 시스템은 한글 한 글자를 3바이트가 아니라 2바이트로 세는 인코딩을 쓰기도 합니다. 그래서 바이트 제한은 **어느 인코딩 기준인지 알아야** 의미가 있습니다. 양식이 밝히지 않으면 UTF-8 기준 숫자를 보수적으로 잡으세요 — 둘 중 큰 쪽입니다.',
            ],
          },
          {
            heading: '제출 전에는 양식에서 직접 확인하세요',
            paragraphs: [
              '외부 계산기는 특정 양식의 규칙을 알 수 없습니다. 초안을 쓰고 근처까지 맞추는 데 쓰되, 마지막에는 실제 입력칸에 붙여 넣고 그 양식이 보여주는 숫자를 읽으세요. 합격·불합격을 가르는 건 그 숫자입니다.',
              '몇 퍼센트는 여유를 두세요. 끝 공백을 잘라내거나 따옴표를 바꾸거나 줄바꿈 방식을 변환하는 양식에서는 초안과 제출본의 숫자가 달라질 수 있습니다.',
            ],
          },
          {
            heading: '이 사이트의 계산기가 초안을 전송하지 않는 이유',
            paragraphs: [
              '자소서는 지원하는 회사, 지나온 이력, 개인 사정이 그대로 담긴 글입니다. 글자 수를 세자고 서버까지 갈 이유가 없습니다.',
              '이 사이트의 계산기는 브라우저 안에서 동작합니다. 입력한 글은 페이지에만 있고 닫으면 사라집니다.',
            ],
          },
        ],
        toolCta: '단어수, 공백 포함·제외 글자수, 줄 수, UTF-8 바이트를 한 번에 확인하세요:',
      },
    },
  },
  {
    slug: 'jpg-png-webp',
    tool: 'image-converter',
    updated: '2026-08-13',
    copy: {
      en: {
        title: 'JPG, PNG, or WebP: which one to use',
        titleTag: 'JPG vs PNG vs WebP - Free Format Guide | Utilark',
        description:
          'What separates JPG, PNG, and WebP, which one suits photos, screenshots, and logos, and why converting between them never restores lost quality.',
        intro: [
          'The three formats are not better and worse versions of each other. They make different trade-offs, and the right choice depends on what the image contains.',
        ],
        sections: [
          {
            heading: 'JPG is for photographs',
            paragraphs: [
              'JPG throws away detail the eye is unlikely to miss, which is why photographs compress so well in it. That same behaviour ruins sharp edges: text, screenshots, and line art come out blurry and smeared around the boundaries.',
              'JPG also cannot store transparency at all. A transparent background becomes a solid one — white, on this site — the moment you save as JPG.',
            ],
          },
          {
            heading: 'PNG is for anything with hard edges',
            paragraphs: [
              'PNG is lossless: what you save is exactly what you had. Screenshots, logos, diagrams, and images with text stay crisp, and transparency is preserved.',
              'The cost is size. A photograph saved as PNG is typically several times larger than the same photograph as JPG, with no visible benefit.',
            ],
          },
          {
            heading: 'WebP does both, usually smaller',
            paragraphs: [
              'WebP has a lossy mode that competes with JPG and a lossless mode that competes with PNG, and it supports transparency in both. For the same visual quality it is generally the smallest of the three.',
              'Browser support is broad now. The remaining friction is outside the browser: some desktop applications, older photo software, and a few upload forms still refuse WebP, which is the usual reason to convert one back to JPG or PNG.',
            ],
          },
          {
            heading: 'Converting never restores quality',
            paragraphs: [
              'This is the point most worth remembering. Detail discarded by a lossy format is gone. Converting a JPG to PNG produces a lossless copy of an already damaged image — larger, and no sharper.',
              'Each lossy re-save damages the image again. If you have to convert repeatedly, keep the original and convert from it every time rather than converting a converted file.',
            ],
          },
          {
            heading: 'What quality setting to use',
            paragraphs: [
              'Lossy formats expose a quality slider, usually 0 to 100. It is not a percentage of anything — it selects how aggressively detail is discarded, and the useful range is narrower than the scale suggests.',
              'Around 80 is the usual sweet spot for photographs. Below roughly 60, compression artefacts become visible as blocky patches in smooth areas like skin and sky. Above 90 the file grows quickly for a difference most people cannot see on a screen.',
              'Judge it on the actual image rather than the number. Photographs with large flat regions and gradients show artefacts far earlier than busy, textured ones, so the right setting is not the same for every picture.',
            ],
          },
          {
            heading: 'A short version',
            list: [
              'Photograph, size matters: JPG, or WebP where it is accepted',
              'Screenshot, logo, diagram, anything with text: PNG, or lossless WebP',
              'Needs transparency: PNG or WebP — never JPG',
              'Something refuses to open a WebP: convert to PNG to keep quality, to JPG to keep it small',
            ],
          },
        ],
        toolCta: 'Convert between all three in your browser, with the files never leaving your device:',
      },
      ko: {
        title: 'JPG·PNG·WebP 어떤 형식을 골라야 할까',
        titleTag: 'JPG PNG WebP 차이 - 무료 형식 가이드 | Utilark',
        description:
          'JPG, PNG, WebP의 차이와 사진·스크린샷·로고에 각각 맞는 형식, 그리고 형식을 바꿔도 화질이 돌아오지 않는 이유를 정리했습니다.',
        intro: [
          '세 형식은 좋고 나쁜 관계가 아닙니다. 서로 다른 것을 포기하는 대신 다른 것을 얻는 구조라, 이미지에 무엇이 담겼는지에 따라 답이 달라집니다.',
        ],
        sections: [
          {
            heading: 'JPG는 사진용입니다',
            paragraphs: [
              'JPG는 눈이 알아채기 어려운 정보를 버리는 방식으로 압축합니다. 사진이 JPG에서 작아지는 이유이고, 동시에 **경계가 뚜렷한 이미지를 망치는** 이유이기도 합니다. 글자, 스크린샷, 선으로 그린 그림은 경계 주변이 번지고 지저분해집니다.',
              'JPG는 투명도도 아예 저장하지 못합니다. JPG로 저장하는 순간 투명한 배경은 단색으로 바뀝니다 — 이 사이트에서는 흰색입니다.',
            ],
          },
          {
            heading: 'PNG는 경계가 선명한 것에 씁니다',
            paragraphs: [
              'PNG는 무손실입니다. 저장한 것이 원본 그대로입니다. 스크린샷, 로고, 도표, 글자가 들어간 이미지가 선명하게 유지되고 투명도도 보존됩니다.',
              '대가는 용량입니다. 사진을 PNG로 저장하면 같은 사진의 JPG보다 보통 몇 배 커지는데, 눈에 보이는 이득은 없습니다.',
            ],
          },
          {
            heading: 'WebP는 둘 다 되고 대체로 더 작습니다',
            paragraphs: [
              'WebP에는 JPG와 겨루는 손실 모드와 PNG와 겨루는 무손실 모드가 있고, 두 모드 모두 투명도를 지원합니다. 같은 화질이면 셋 중 가장 작은 경우가 일반적입니다.',
              '브라우저 지원은 이제 충분히 넓습니다. 남은 걸림돌은 브라우저 밖입니다 — 일부 데스크톱 프로그램, 오래된 사진 앱, 몇몇 업로드 양식이 아직 WebP를 받지 않습니다. WebP를 다시 JPG나 PNG로 되돌리는 이유는 대개 이것입니다.',
            ],
          },
          {
            heading: '형식을 바꿔도 화질은 돌아오지 않습니다',
            paragraphs: [
              '가장 기억할 만한 대목입니다. 손실 압축이 버린 정보는 사라진 것입니다. JPG를 PNG로 바꾸면 **이미 상한 이미지의 무손실 사본**이 됩니다 — 용량만 커지고 더 선명해지지 않습니다.',
              '손실 형식으로 다시 저장할 때마다 이미지는 또 상합니다. 여러 번 변환해야 한다면 변환한 파일을 또 변환하지 말고, 원본을 남겨 두고 매번 원본에서 변환하세요.',
            ],
          },
          {
            heading: '화질 설정은 얼마로 두어야 하나',
            paragraphs: [
              '손실 형식에는 보통 0에서 100까지의 화질 슬라이더가 있습니다. 무엇의 백분율도 아니고, 정보를 얼마나 과감하게 버릴지를 고르는 값입니다. 실제로 쓸 만한 구간은 눈금이 시사하는 것보다 좁습니다.',
              '사진은 **80 부근**이 무난합니다. 대략 60 아래로 내려가면 피부나 하늘처럼 부드러운 면에 네모난 얼룩이 눈에 띄기 시작합니다. 90을 넘기면 용량은 빠르게 커지는데 화면에서 구분하기 어려운 차이만 남습니다.',
              '숫자보다 실제 이미지를 보고 판단하세요. 넓은 단색 면이나 그러데이션이 있는 사진은 복잡하고 질감이 많은 사진보다 훨씬 일찍 얼룩이 보입니다. 모든 사진에 같은 설정이 맞지 않는 이유입니다.',
            ],
          },
          {
            heading: '짧게 정리하면',
            list: [
              '사진이고 용량이 중요하다: JPG, 받아주는 곳이면 WebP',
              '스크린샷·로고·도표 등 글자나 선이 있다: PNG, 또는 무손실 WebP',
              '투명 배경이 필요하다: PNG 또는 WebP — JPG는 안 됩니다',
              'WebP를 못 여는 프로그램이 있다: 화질을 지키려면 PNG, 용량을 지키려면 JPG',
            ],
          },
        ],
        toolCta: '세 형식 사이의 변환을 브라우저에서, 파일을 기기 밖으로 내보내지 않고 처리하세요:',
      },
    },
  },
  {
    slug: 'merge-pdf-without-uploading',
    tool: 'merge-pdf',
    updated: '2026-08-13',
    copy: {
      en: {
        title: 'Merging PDFs without uploading them',
        titleTag: 'Merge PDF Safely - Free Privacy Guide | Utilark',
        description:
          'What actually happens when a PDF tool asks you to upload, when that matters, and what browser-side merging can and cannot do instead.',
        intro: [
          'Most online PDF tools send your file to a server, merge it there, and send the result back. Many of them say the upload is deleted within the hour, and that is usually true.',
          'It is still worth knowing which documents you are comfortable sending, because a merge is very often the last step before submitting something sensitive.',
        ],
        sections: [
          {
            heading: 'What you are usually merging',
            paragraphs: [
              'The documents people combine are contracts, bank statements, medical records, identity documents, and application packets. That is the nature of the task — you merge things that have to be submitted together.',
              'Deletion after an hour limits how long a copy exists. It does not remove the transfer itself, the provider\'s logs, or the question of which jurisdiction the server sits in. For a scanned passport, those are reasonable things to care about.',
            ],
          },
          {
            heading: 'What browser-side merging changes',
            paragraphs: [
              'A browser can read PDF files and write a new one without a server. The file is opened from your disk by the page, combined in memory, and saved back to your downloads. Nothing is transmitted.',
              'This is not a claim that needs trust in a policy — with the tool open, you can disconnect from the network entirely and it still works.',
            ],
          },
          {
            heading: 'What it cannot do',
            paragraphs: [
              'Browser processing uses your device\'s memory, so very large files can fail where a server would succeed. Splitting the job into a few smaller merges usually solves it, and a desktop machine has more headroom than a phone.',
              'Password-protected and encrypted PDFs will not open. Remove the protection with software you are authorized to use, then merge.',
            ],
          },
          {
            heading: 'What merging does not do',
            paragraphs: [
              'Merging concatenates documents. It does not re-encode them, so the result is roughly the sum of the inputs — a merge will not make a large submission smaller, and a set of high-resolution scans stays large. Compress first if there is a size limit on the other end.',
              'It does not reorder pages inside a file either. You control the order the documents are combined in, but a document whose own pages are out of order arrives that way. Fix that in the source file before merging.',
              'Scanned pages remain images. If the recipient needs selectable or searchable text, the scans need optical character recognition, which is a separate step that merging will not perform.',
            ],
          },
          {
            heading: 'Before you merge',
            list: [
              'Confirm the order — pages are combined exactly as listed, and reordering after the fact means merging again',
              'Check the page count of the result against the sum of the inputs',
              'Open the merged file once before submitting it; a document that fails to render is better found now',
              'Keep the originals until the submission is accepted',
            ],
          },
        ],
        toolCta: 'Combine PDFs in your browser, reorder them first, and download the result:',
      },
      ko: {
        title: 'PDF를 업로드하지 않고 합치는 법',
        titleTag: 'PDF 합치기 안전하게 - 무료 가이드 | Utilark',
        description:
          '온라인 PDF 도구가 업로드를 요구할 때 실제로 무슨 일이 일어나는지, 그게 언제 문제가 되는지, 브라우저 처리로는 무엇이 되고 무엇이 안 되는지 정리했습니다.',
        intro: [
          '대부분의 온라인 PDF 도구는 파일을 서버로 보내 거기서 합치고 결과를 돌려줍니다. 상당수가 "한 시간 내 삭제"를 약속하고, 보통 사실입니다.',
          '그래도 어떤 문서까지 보낼지는 알고 정하는 편이 낫습니다. PDF를 합치는 일은 **중요한 서류를 제출하기 직전 단계**인 경우가 많기 때문입니다.',
        ],
        sections: [
          {
            heading: '보통 무엇을 합치는가',
            paragraphs: [
              '사람들이 합치는 문서는 계약서, 거래내역서, 진료기록, 신분증 사본, 지원 서류 묶음입니다. 함께 제출해야 하는 것들을 합치는 작업이니 당연한 결과입니다.',
              '한 시간 뒤 삭제는 사본이 존재하는 기간을 줄여줍니다. 다만 **전송 자체**, 제공업체의 접속 기록, 서버가 어느 나라에 있는지는 그대로 남습니다. 여권 스캔본이라면 신경 쓸 만한 것들입니다.',
            ],
          },
          {
            heading: '브라우저 처리가 바꾸는 것',
            paragraphs: [
              '브라우저는 서버 없이도 PDF를 읽고 새 파일을 만들 수 있습니다. 페이지가 사용자 디스크에서 파일을 열고 메모리에서 합친 뒤 다운로드 폴더에 저장합니다. 전송되는 것이 없습니다.',
              '이건 방침을 믿어야 하는 종류의 주장이 아닙니다 — 도구를 연 상태에서 **네트워크를 완전히 끊어도 그대로 동작합니다.**',
            ],
          },
          {
            heading: '안 되는 것',
            paragraphs: [
              '브라우저 처리는 기기의 메모리를 씁니다. 그래서 아주 큰 파일은 서버였다면 됐을 작업이 실패할 수 있습니다. 몇 개씩 나눠 합치면 대개 해결되고, 휴대폰보다 데스크톱이 여유가 많습니다.',
              '비밀번호가 걸리거나 암호화된 PDF는 열리지 않습니다. 권한이 있는 프로그램으로 보호를 해제한 뒤 합치세요.',
            ],
          },
          {
            heading: '합쳐도 되지 않는 것',
            paragraphs: [
              '합치기는 문서를 이어 붙이는 작업입니다. 다시 인코딩하지 않으므로 결과물 용량은 대체로 원본들의 합입니다 — **합친다고 제출물이 작아지지 않고**, 고해상도 스캔 묶음은 그대로 큽니다. 제출처에 용량 제한이 있다면 합치기 전에 압축하세요.',
              '파일 **안쪽**의 페이지 순서도 바꾸지 않습니다. 문서를 어떤 순서로 이어 붙일지는 정할 수 있지만, 문서 자체의 페이지가 뒤섞여 있으면 그대로 들어갑니다. 원본 파일에서 먼저 고쳐야 합니다.',
              '스캔한 페이지는 계속 이미지입니다. 받는 쪽에서 글자를 선택하거나 검색할 수 있어야 한다면 문자 인식(OCR)이 따로 필요하고, 합치기가 대신해주지 않습니다.',
            ],
          },
          {
            heading: '합치기 전에 확인할 것',
            list: [
              '순서 확인 — 표시된 순서 그대로 합쳐지고, 나중에 바꾸려면 다시 합쳐야 합니다',
              '결과물의 페이지 수가 원본들의 합과 맞는지 확인',
              '제출 전에 합친 파일을 한 번 열어보기 — 안 열리는 문서는 지금 발견하는 게 낫습니다',
              '제출이 수리될 때까지 원본 보관',
            ],
          },
        ],
        toolCta: '브라우저에서 순서를 정해 PDF를 합치고 결과를 내려받으세요:',
      },
    },
  },
];

export const guidesForTool = (slug: ToolDefinition['slug']): GuideDefinition[] =>
  guides.filter((guide) => guide.tool === slug);
