import type { Locale } from '../i18n/ui';
import type { ToolCopy } from './tools';

export type ImageFormat = 'jpg' | 'png' | 'webp';

export const MIME: Record<ImageFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export type ConversionDefinition = {
  slug: string;
  from: ImageFormat;
  to: ImageFormat;
  accent: string;
  icon: string;
  copy: Record<Locale, ToolCopy>;
};

/**
 * One page per directed pair, which is what every ranking converter does —
 * `freeconvert.com/png-to-jpg` and `/jpg-to-png` are separate pages, and
 * `png2jpg.com` and `jpg2png.com` are separate domains (docs/seo-research.md,
 * four independent cases, no counterexample found).
 *
 * The copy has to differ per pair, not just swap two format names. Six pages
 * saying the same thing would be clustered as duplicates and only one would be
 * shown, which would undo the split. Each direction genuinely has its own
 * story: what is lost, what grows, and why anyone converts that way.
 */
export const conversions: ConversionDefinition[] = [
  {
    slug: 'png-to-jpg',
    from: 'png',
    to: 'jpg',
    accent: '#ff8f70',
    icon: '◧',
    copy: {
      en: {
        name: 'PNG to JPG',
        titleTag: 'PNG to JPG - Convert PNG to JPG Free Online | Utilark',
        short: 'Convert PNG images to JPG and cut the file size.',
        description:
          'Free PNG to JPG converter. Photographs shrink dramatically, transparency is filled with white, and the images never leave your browser.',
        keywords: ['PNG to JPG', 'convert PNG to JPG', 'PNG to JPEG', 'reduce PNG size'],
        intro: [
          'This is the conversion people reach for when a PNG is too large to send. A photograph saved as PNG is often several times bigger than the same picture as JPG, with no visible difference.',
          'Two things change. Transparency cannot survive — transparent areas are filled with white — and the compression is lossy, so a screenshot or an image containing text will soften around the edges.',
        ],
        steps: [
          'Choose one or more PNG files.',
          'Set the quality; around 85 is a good default for photographs.',
          'Convert and download the JPG files.',
        ],
        faq: [
          {
            question: 'Why did my transparent background turn white?',
            answer: 'JPG has no way to store transparency. Every transparent pixel has to be given a colour, and white is the standard choice.',
          },
          {
            question: 'How much smaller will the file be?',
            answer: 'For photographs, often a fifth of the PNG or less. For screenshots and flat graphics the saving is much smaller, and the quality cost is much higher.',
          },
          {
            question: 'Should I convert a screenshot to JPG?',
            answer: 'Usually not. JPG blurs sharp edges, so text and interface lines come out fuzzy. Keep screenshots as PNG, or use WebP if size matters.',
          },
        ],
      },
      ko: {
        name: 'PNG를 JPG로 변환',
        titleTag: 'PNG JPG 변환 - 무료 온라인 변환기 | Utilark',
        short: 'PNG 이미지를 JPG로 바꿔 용량을 줄입니다.',
        description:
          '무료 PNG JPG 변환기입니다. 사진은 용량이 크게 줄고 투명 배경은 흰색으로 채워지며, 이미지는 브라우저 밖으로 나가지 않습니다.',
        keywords: ['PNG JPG 변환', 'PNG를 JPG로', 'PNG 용량 줄이기', '이미지 확장자 변환'],
        intro: [
          'PNG 파일이 너무 커서 보내기 어려울 때 쓰는 변환입니다. PNG로 저장한 사진은 같은 사진의 JPG보다 몇 배 큰 경우가 많은데, 눈으로 보이는 차이는 없습니다.',
          '두 가지가 달라집니다. 투명도는 살아남지 못해 투명한 부분이 **흰색으로 채워지고**, 손실 압축이라 스크린샷이나 글자가 있는 이미지는 경계가 뭉개집니다.',
        ],
        steps: [
          'PNG 파일을 하나 이상 선택합니다.',
          '화질을 정합니다. 사진은 85 부근이 무난합니다.',
          '변환하고 JPG 파일을 내려받습니다.',
        ],
        faq: [
          {
            question: '투명 배경이 왜 흰색이 되나요?',
            answer: 'JPG는 투명도를 저장할 방법이 없습니다. 투명한 픽셀에도 색을 정해줘야 하고, 흰색이 표준적인 선택입니다.',
          },
          {
            question: '용량이 얼마나 줄어드나요?',
            answer: '사진이면 PNG의 5분의 1 이하로 줄어드는 경우가 많습니다. 스크린샷이나 단색 위주 그래픽은 절감폭이 훨씬 작고 화질 손해는 훨씬 큽니다.',
          },
          {
            question: '스크린샷도 JPG로 바꿔야 하나요?',
            answer: '대개 아닙니다. JPG는 뚜렷한 경계를 흐리게 만들어 글자와 화면 선이 지저분해집니다. 스크린샷은 PNG로 두고, 용량이 문제면 WebP를 쓰세요.',
          },
        ],
      },
    },
  },
  {
    slug: 'jpg-to-png',
    from: 'jpg',
    to: 'png',
    accent: '#76b8ff',
    icon: '◨',
    copy: {
      en: {
        name: 'JPG to PNG',
        titleTag: 'JPG to PNG - Convert JPG to PNG Free Online | Utilark',
        short: 'Convert JPG images to lossless PNG in your browser.',
        description:
          'Free JPG to PNG converter. Produces a lossless copy for editing or for tools that require PNG, with the files processed on your device.',
        keywords: ['JPG to PNG', 'convert JPG to PNG', 'JPEG to PNG', 'lossless image copy'],
        intro: [
          'Worth saying first: this will not improve the picture. Detail that JPG discarded is gone, and PNG cannot bring it back. What you get is a lossless copy of an already compressed image, and it will be larger than the original.',
          'It is still the right conversion in two cases — when a tool or a submission form only accepts PNG, and when you are about to edit and re-save repeatedly and want no further loss with each save.',
        ],
        steps: [
          'Choose one or more JPG files.',
          'PNG is lossless, so there is no quality setting to pick.',
          'Convert and download the PNG files.',
        ],
        faq: [
          {
            question: 'Does converting to PNG improve quality?',
            answer: 'No. It preserves exactly what is in the JPG, including the compression artefacts already baked into it. Nothing is recovered.',
          },
          {
            question: 'Why is the PNG bigger than the JPG?',
            answer: 'PNG stores every pixel exactly instead of discarding detail. For photographs that usually means several times the size.',
          },
          {
            question: 'Will this give me a transparent background?',
            answer: 'No. PNG supports transparency, but a JPG has none to carry over. The background stays whatever colour it already was; removing it is a separate editing job.',
          },
        ],
      },
      ko: {
        name: 'JPG를 PNG로 변환',
        titleTag: 'JPG PNG 변환 - 무료 온라인 변환기 | Utilark',
        short: 'JPG 이미지를 무손실 PNG로 브라우저에서 변환합니다.',
        description:
          '무료 JPG PNG 변환기입니다. 편집용 무손실 사본이나 PNG만 받는 곳에 낼 파일을 만들며, 처리는 사용자 기기에서 이뤄집니다.',
        keywords: ['JPG PNG 변환', 'JPG를 PNG로', 'JPEG PNG 변환', '무손실 이미지 사본'],
        intro: [
          '먼저 짚고 갈 것이 있습니다. **이 변환은 사진을 좋게 만들지 않습니다.** JPG가 버린 정보는 사라진 것이고 PNG가 되살릴 수 없습니다. 결과물은 이미 압축된 이미지의 무손실 사본이며 원본보다 커집니다.',
          '그래도 두 경우에는 맞는 변환입니다 — PNG만 받는 프로그램이나 제출 양식에 내야 할 때, 그리고 앞으로 여러 번 편집하고 저장할 예정이라 저장할 때마다 더 상하는 것을 막고 싶을 때입니다.',
        ],
        steps: [
          'JPG 파일을 하나 이상 선택합니다.',
          'PNG는 무손실이라 화질을 고를 필요가 없습니다.',
          '변환하고 PNG 파일을 내려받습니다.',
        ],
        faq: [
          {
            question: 'PNG로 바꾸면 화질이 좋아지나요?',
            answer: '아니요. JPG에 담긴 것을 그대로 보존할 뿐이고, 이미 새겨진 압축 흔적까지 함께 보존합니다. 복원되는 것은 없습니다.',
          },
          {
            question: 'PNG가 JPG보다 큰 이유는 무엇인가요?',
            answer: 'PNG는 정보를 버리지 않고 모든 픽셀을 그대로 저장합니다. 사진이면 보통 몇 배 커집니다.',
          },
          {
            question: '변환하면 배경이 투명해지나요?',
            answer: '아니요. PNG가 투명도를 지원하긴 하지만 JPG에는 넘겨줄 투명 정보가 없습니다. 배경은 원래 색 그대로이고, 배경을 지우는 것은 별도의 편집 작업입니다.',
          },
        ],
      },
    },
  },
  {
    slug: 'webp-to-jpg',
    from: 'webp',
    to: 'jpg',
    accent: '#9c88ff',
    icon: '◩',
    copy: {
      en: {
        name: 'WebP to JPG',
        titleTag: 'WebP to JPG - Convert WebP to JPG Free Online | Utilark',
        short: 'Turn WebP images into JPG that any program will open.',
        description:
          'Free WebP to JPG converter for images that a program, printer, or upload form refuses to accept. Conversion happens in your browser.',
        keywords: ['WebP to JPG', 'convert WebP to JPG', 'WebP to JPEG', 'open WebP file'],
        intro: [
          'Almost everyone doing this conversion has hit the same wall: an image saved from the web is a WebP, and something downstream will not take it — an older photo editor, a print service, a job application upload, a device gallery.',
          'JPG is the safest thing to hand such a system. The cost is another round of lossy compression on an already lossy file, and the loss of any transparency the WebP carried.',
        ],
        steps: [
          'Choose the WebP files that will not open.',
          'Set the quality; keep it high to limit a second round of loss.',
          'Convert and download the JPG files.',
        ],
        faq: [
          {
            question: 'Why will nothing open my WebP file?',
            answer: 'Browsers support WebP broadly, but plenty of desktop software, print services, and upload forms still do not. That gap is the usual reason for this conversion.',
          },
          {
            question: 'Does converting lose quality?',
            answer: 'Some. A lossy WebP is decoded and then compressed again as JPG, and each lossy pass costs a little. Choosing a high quality setting keeps it small enough to be hard to see.',
          },
          {
            question: 'What happens to a transparent WebP?',
            answer: 'The transparency is filled with white, because JPG cannot store it. Convert to PNG instead if you need to keep it.',
          },
        ],
      },
      ko: {
        name: 'WebP를 JPG로 변환',
        titleTag: 'WebP JPG 변환 - 무료 온라인 변환기 | Utilark',
        short: 'WebP 이미지를 어디서든 열리는 JPG로 바꿉니다.',
        description:
          '프로그램·인쇄소·업로드 양식이 받아주지 않는 WebP를 위한 무료 WebP JPG 변환기입니다. 변환은 브라우저에서 진행됩니다.',
        keywords: ['WebP JPG 변환', 'WebP를 JPG로', 'WebP 안 열림', 'WebP 파일 변환'],
        intro: [
          '이 변환을 찾는 사람은 대개 같은 벽에 부딪힙니다. 웹에서 저장한 이미지가 WebP인데 그다음 단계가 받아주지 않는 것입니다 — 오래된 사진 편집기, 인쇄 업체, 입사지원 첨부, 기기 갤러리 같은 곳입니다.',
          '그런 시스템에 건네기 가장 안전한 형식이 JPG입니다. 대가는 이미 손실 압축된 파일에 손실 압축을 한 번 더 하는 것과, WebP가 갖고 있던 투명도를 잃는 것입니다.',
        ],
        steps: [
          '열리지 않는 WebP 파일을 선택합니다.',
          '화질을 정합니다. 두 번째 손실을 줄이려면 높게 두세요.',
          '변환하고 JPG 파일을 내려받습니다.',
        ],
        faq: [
          {
            question: 'WebP 파일이 왜 아무 데서도 안 열리나요?',
            answer: '브라우저는 WebP를 폭넓게 지원하지만, 데스크톱 프로그램·인쇄 서비스·업로드 양식 중에는 아직 안 받는 곳이 많습니다. 이 간극이 이 변환의 주된 이유입니다.',
          },
          {
            question: '변환하면 화질이 떨어지나요?',
            answer: '조금 떨어집니다. 손실 WebP를 풀었다가 JPG로 다시 압축하는 과정이라 손실 단계가 한 번 더 생깁니다. 화질을 높게 잡으면 알아보기 어려운 수준으로 줄일 수 있습니다.',
          },
          {
            question: '투명한 WebP는 어떻게 되나요?',
            answer: 'JPG가 투명도를 저장하지 못해 흰색으로 채워집니다. 투명도를 지켜야 하면 PNG로 변환하세요.',
          },
        ],
      },
    },
  },
  {
    slug: 'jpg-to-webp',
    from: 'jpg',
    to: 'webp',
    accent: '#e0a11f',
    icon: '◪',
    copy: {
      en: {
        name: 'JPG to WebP',
        titleTag: 'JPG to WebP - Convert JPG to WebP Free Online | Utilark',
        short: 'Shrink JPG photographs by converting them to WebP.',
        description:
          'Free JPG to WebP converter for smaller images at the same visual quality, useful for page speed. Files are processed in your browser.',
        keywords: ['JPG to WebP', 'convert JPG to WebP', 'JPEG to WebP', 'compress images for web'],
        intro: [
          'WebP generally reaches the same visual quality as JPG in a noticeably smaller file, which is why this conversion is usually about page weight — a gallery, a product listing, a site that has to load quickly on mobile data.',
          'Keep in mind that the source is already lossy. Converting re-compresses it, so pick a high quality setting rather than chasing the smallest possible file, and keep the JPG originals.',
        ],
        steps: [
          'Choose one or more JPG files.',
          'Set the quality; start high and lower it only if the size is still too big.',
          'Convert and download the WebP files.',
        ],
        faq: [
          {
            question: 'How much smaller are the files?',
            answer: 'It varies with the picture, but a meaningful reduction at matching quality is typical. Busy, textured photographs benefit less than smooth ones.',
          },
          {
            question: 'Will visitors be able to see WebP?',
            answer: 'Every current browser displays WebP. The gap is outside the browser, in desktop software and upload forms, which is why people convert back the other way.',
          },
          {
            question: 'Is converting twice a problem?',
            answer: 'Each lossy save costs a little quality. Convert from the original JPG rather than from a file that has already been through another conversion.',
          },
        ],
      },
      ko: {
        name: 'JPG를 WebP로 변환',
        titleTag: 'JPG WebP 변환 - 무료 온라인 변환기 | Utilark',
        short: 'JPG 사진을 WebP로 바꿔 용량을 줄입니다.',
        description:
          '같은 화질에서 더 작은 파일을 만드는 무료 JPG WebP 변환기입니다. 페이지 속도 개선에 쓰이며 파일은 브라우저에서 처리됩니다.',
        keywords: ['JPG WebP 변환', 'JPG를 WebP로', '이미지 용량 줄이기', '웹용 이미지 압축'],
        intro: [
          'WebP는 대체로 JPG와 같은 화질을 눈에 띄게 작은 파일로 담습니다. 그래서 이 변환은 보통 페이지 무게 때문에 합니다 — 갤러리, 상품 목록, 모바일 데이터에서 빨리 떠야 하는 사이트 같은 경우입니다.',
          '원본이 이미 손실 압축이라는 점은 기억하세요. 변환은 재압축이므로 **가장 작은 파일을 좇기보다 화질을 높게 잡고**, JPG 원본을 남겨 두세요.',
        ],
        steps: [
          'JPG 파일을 하나 이상 선택합니다.',
          '화질을 정합니다. 높게 시작하고 그래도 크면 그때 낮추세요.',
          '변환하고 WebP 파일을 내려받습니다.',
        ],
        faq: [
          {
            question: '용량이 얼마나 줄어드나요?',
            answer: '사진에 따라 다르지만 같은 화질 기준으로 의미 있게 줄어드는 것이 일반적입니다. 질감이 복잡한 사진은 매끈한 사진보다 이득이 적습니다.',
          },
          {
            question: '방문자가 WebP를 볼 수 있나요?',
            answer: '현재 쓰이는 브라우저는 모두 WebP를 표시합니다. 문제는 브라우저 밖 — 데스크톱 프로그램과 업로드 양식이고, 그래서 반대 방향 변환을 찾는 사람이 있습니다.',
          },
          {
            question: '두 번 변환하면 문제가 되나요?',
            answer: '손실 저장을 할 때마다 화질이 조금씩 깎입니다. 이미 다른 변환을 거친 파일 말고 JPG 원본에서 변환하세요.',
          },
        ],
      },
    },
  },
  {
    slug: 'png-to-webp',
    from: 'png',
    to: 'webp',
    accent: '#57c7a2',
    icon: '◫',
    copy: {
      en: {
        name: 'PNG to WebP',
        titleTag: 'PNG to WebP - Convert PNG to WebP Free Online | Utilark',
        short: 'Make PNG images smaller while keeping transparency.',
        description:
          'Free PNG to WebP converter. Unlike JPG, WebP keeps transparency, so logos and screenshots shrink without a white background appearing.',
        keywords: ['PNG to WebP', 'convert PNG to WebP', 'transparent WebP', 'shrink PNG'],
        intro: [
          'This is the conversion to use when a PNG is too heavy but you cannot lose the transparent background. WebP supports transparency where JPG does not, so logos, icons, and screenshots come out smaller with the background intact.',
          'The quality setting matters more here than with photographs. Screenshots and graphics with text hold up well at high quality and start to look smeared if you push it down.',
        ],
        steps: [
          'Choose one or more PNG files.',
          'Set the quality high — graphics and text show compression sooner than photographs do.',
          'Convert and download the WebP files.',
        ],
        faq: [
          {
            question: 'Does the transparent background survive?',
            answer: 'Yes. This is the main reason to pick WebP over JPG for images that have transparency.',
          },
          {
            question: 'Is this better than PNG to JPG for a logo?',
            answer: 'For a logo, yes on both counts — the transparency is kept and the edges stay cleaner, because JPG blurs exactly the kind of sharp boundary a logo is made of.',
          },
          {
            question: 'Why does my screenshot look smudged?',
            answer: 'The quality setting is too low. Text and interface lines need a higher setting than photographs; raise it and convert the original again.',
          },
        ],
      },
      ko: {
        name: 'PNG를 WebP로 변환',
        titleTag: 'PNG WebP 변환 - 무료 온라인 변환기 | Utilark',
        short: '투명 배경을 유지하면서 PNG 용량을 줄입니다.',
        description:
          '무료 PNG WebP 변환기입니다. JPG와 달리 WebP는 투명도를 지원해서, 로고와 스크린샷을 흰 배경이 생기지 않게 줄일 수 있습니다.',
        keywords: ['PNG WebP 변환', 'PNG를 WebP로', '투명 배경 유지', 'PNG 용량 줄이기'],
        intro: [
          'PNG가 무거운데 **투명 배경은 포기할 수 없을 때** 쓰는 변환입니다. JPG와 달리 WebP는 투명도를 지원하므로 로고, 아이콘, 스크린샷을 배경 그대로 두고 줄일 수 있습니다.',
          '여기서는 화질 설정이 사진보다 더 중요합니다. 스크린샷이나 글자가 있는 그래픽은 화질을 높게 두면 잘 버티지만 낮추면 금방 번져 보입니다.',
        ],
        steps: [
          'PNG 파일을 하나 이상 선택합니다.',
          '화질을 높게 잡습니다. 그래픽과 글자는 사진보다 압축 흔적이 빨리 보입니다.',
          '변환하고 WebP 파일을 내려받습니다.',
        ],
        faq: [
          {
            question: '투명 배경이 유지되나요?',
            answer: '유지됩니다. 투명도가 있는 이미지에서 JPG 대신 WebP를 고르는 가장 큰 이유입니다.',
          },
          {
            question: '로고라면 PNG를 JPG로 바꾸는 것보다 나은가요?',
            answer: '로고라면 두 가지 면에서 낫습니다 — 투명도가 유지되고 경계가 더 깨끗합니다. JPG는 로고를 이루는 뚜렷한 경계를 정확히 흐리게 만들기 때문입니다.',
          },
          {
            question: '스크린샷이 번져 보이는 이유는 무엇인가요?',
            answer: '화질 설정이 낮아서입니다. 글자와 화면 선은 사진보다 높은 설정이 필요합니다. 값을 올리고 원본에서 다시 변환하세요.',
          },
        ],
      },
    },
  },
  {
    slug: 'webp-to-png',
    from: 'webp',
    to: 'png',
    accent: '#ef7fa8',
    icon: '◧',
    copy: {
      en: {
        name: 'WebP to PNG',
        titleTag: 'WebP to PNG - Convert WebP to PNG Free Online | Utilark',
        short: 'Convert WebP to PNG and keep the transparent background.',
        description:
          'Free WebP to PNG converter for programs that cannot open WebP, keeping transparency intact and adding no further compression loss.',
        keywords: ['WebP to PNG', 'convert WebP to PNG', 'WebP transparent PNG', 'open WebP file'],
        intro: [
          'Like WebP to JPG, this is usually about compatibility — something will not open a WebP. The difference is that PNG keeps the transparent background and adds no compression loss of its own, so it is the right target for logos, icons, and anything with a cut-out background.',
          'The trade is size. PNG stores every pixel exactly, so expect the file to grow, sometimes a lot.',
        ],
        steps: [
          'Choose the WebP files you need in another format.',
          'PNG is lossless, so there is no quality setting.',
          'Convert and download the PNG files.',
        ],
        faq: [
          {
            question: 'Is the transparency kept?',
            answer: 'Yes. PNG stores transparency, so a cut-out background survives the conversion intact.',
          },
          {
            question: 'Does this add any quality loss?',
            answer: 'None of its own. PNG copies the decoded image exactly. Anything the WebP had already lost stays lost.',
          },
          {
            question: 'Should I use PNG or JPG for this?',
            answer: 'PNG when the image has transparency, sharp edges, or text. JPG when it is a photograph and the file size matters more than a perfect copy.',
          },
        ],
      },
      ko: {
        name: 'WebP를 PNG로 변환',
        titleTag: 'WebP PNG 변환 - 무료 온라인 변환기 | Utilark',
        short: 'WebP를 투명 배경 그대로 PNG로 변환합니다.',
        description:
          'WebP를 열지 못하는 프로그램을 위한 무료 WebP PNG 변환기입니다. 투명도를 그대로 유지하고 추가 압축 손실이 없습니다.',
        keywords: ['WebP PNG 변환', 'WebP를 PNG로', 'WebP 투명 배경', 'WebP 파일 변환'],
        intro: [
          'WebP를 JPG로 바꾸는 경우와 마찬가지로 대개 호환성 문제입니다 — 무언가가 WebP를 못 엽니다. 차이는 PNG가 **투명 배경을 유지하고 자체 압축 손실이 없다**는 점입니다. 그래서 로고, 아이콘, 배경을 딴 이미지에는 이쪽이 맞습니다.',
          '대가는 용량입니다. PNG는 모든 픽셀을 그대로 저장하므로 파일이 커지고, 때로는 많이 커집니다.',
        ],
        steps: [
          '다른 형식이 필요한 WebP 파일을 선택합니다.',
          'PNG는 무손실이라 화질 설정이 없습니다.',
          '변환하고 PNG 파일을 내려받습니다.',
        ],
        faq: [
          {
            question: '투명도가 유지되나요?',
            answer: '유지됩니다. PNG는 투명도를 저장하므로 배경을 딴 이미지가 그대로 넘어옵니다.',
          },
          {
            question: '화질 손실이 추가로 생기나요?',
            answer: '이 변환 자체로는 없습니다. PNG는 풀어낸 이미지를 그대로 복사합니다. WebP가 이미 잃은 것은 그대로 잃은 상태로 남습니다.',
          },
          {
            question: 'PNG와 JPG 중 무엇을 골라야 하나요?',
            answer: '투명도·뚜렷한 경계·글자가 있으면 PNG입니다. 사진이고 완벽한 사본보다 용량이 중요하면 JPG입니다.',
          },
        ],
      },
    },
  },
];

export const getConversion = (slug: string): ConversionDefinition | undefined =>
  conversions.find((conversion) => conversion.slug === slug);
