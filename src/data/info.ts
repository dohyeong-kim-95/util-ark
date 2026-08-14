import type { Locale } from '../i18n/ui';

export type InfoPageKind = 'about' | 'privacy' | 'terms' | 'contact';

type Section = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  links?: Array<{ label: string; href: string }>;
};

export type InfoCopy = {
  title: string;
  description: string;
  lead: string;
  notice?: string;
  /** ISO date shown as the page-specific last update. */
  updated: string;
  sections: Section[];
};

export const infoPages: Record<InfoPageKind, Record<Locale, InfoCopy>> = {
  about: {
    en: {
      title: 'About Utilark',
      description:
        'Learn why Utilark builds small, focused browser tools with clear privacy boundaries and bilingual support.',
      lead: 'Utilark is an independent collection of practical tools for small, everyday tasks.',
      updated: '2026-08-12',
      sections: [
        {
          heading: 'What we are building',
          paragraphs: [
            'Each tool is designed to be understandable at a glance and useful without an account. The first release focuses on jobs that can be completed entirely in a modern browser.',
            'Utilark supports English and Korean as first-class languages. Tool instructions, help content, and important policy pages are maintained in both languages.',
          ],
        },
        {
          heading: 'Our privacy boundary',
          paragraphs: [
            'When a tool says it runs in your browser, the selected files or entered text are processed on your device and are not sent to Utilark. Any future tool that needs a server will be clearly labeled before you use it.',
          ],
        },
        {
          heading: 'Independent from Bubblelab',
          paragraphs: [
            'Utilark began by reviewing useful browser-based ideas from Bubblelab, but it is a separate project with its own domain, source repository, deployment, infrastructure, and future administration boundary.',
          ],
        },
        {
          heading: 'Who runs Utilark and how it is funded',
          paragraphs: [
            'Utilark is built and operated by one independent maintainer, not a company. The source code is public, so anyone can review how a tool handles the files and text you give it.',
            'Running costs are covered by advertising shown on tool pages. Advertising never changes what a tool does, and no tool result is withheld behind an ad. Reach the maintainer through the contact form.',
          ],
          links: [
            { label: 'Contact form', href: '/en/contact/' },
            { label: 'Privacy Policy', href: '/en/privacy/' },
          ],
        },
      ],
    },
    ko: {
      title: 'Utilark 소개',
      description:
        'Utilark가 명확한 개인정보 보호 기준과 한·영 지원을 갖춘 작은 브라우저 도구를 만드는 이유를 소개합니다.',
      lead: 'Utilark는 일상의 작은 작업을 해결하는 실용적인 도구 모음입니다.',
      updated: '2026-08-12',
      sections: [
        {
          heading: '무엇을 만들고 있나요?',
          paragraphs: [
            '각 도구는 처음 봐도 이해하기 쉽고 회원가입 없이 쓸 수 있도록 설계합니다. 첫 공개판은 최신 브라우저 안에서 모든 작업을 끝낼 수 있는 기능에 집중했습니다.',
            '영어와 한국어를 동등하게 지원합니다. 도구 안내, 도움말, 주요 정책 페이지를 두 언어로 함께 관리합니다.',
          ],
        },
        {
          heading: '개인정보 보호 기준',
          paragraphs: [
            '브라우저에서 처리한다고 표시된 도구는 선택한 파일이나 입력한 글을 사용자의 기기에서 처리하며 Utilark로 전송하지 않습니다. 앞으로 서버가 필요한 도구를 추가한다면 사용 전에 분명하게 표시합니다.',
          ],
        },
        {
          heading: 'Bubblelab과 독립된 프로젝트',
          paragraphs: [
            'Utilark는 Bubblelab의 브라우저형 도구 아이디어를 검토하며 시작했지만, 별도의 도메인·소스 저장소·배포·인프라·관리 영역을 사용하는 독립 프로젝트입니다.',
          ],
        },
        {
          heading: '운영 주체와 운영 비용',
          paragraphs: [
            'Utilark는 회사가 아니라 한 명의 독립 개발자가 만들고 운영합니다. 소스 코드를 공개하고 있어 각 도구가 파일과 글을 어떻게 다루는지 누구나 직접 확인할 수 있습니다.',
            '운영 비용은 도구 페이지에 표시되는 광고로 충당합니다. 광고가 도구의 동작을 바꾸지 않으며, 광고를 보아야만 결과를 받을 수 있게 하지 않습니다. 문의는 문의 폼으로 보내주세요.',
          ],
          links: [
            { label: '문의 폼', href: '/ko/contact/' },
            { label: '개인정보 처리방침', href: '/ko/privacy/' },
          ],
        },
      ],
    },
  },
  privacy: {
    en: {
      title: 'Privacy Policy',
      description:
        'How Utilark handles browser-processed files, access logs, advertising, and other data when you use the service.',
      lead: 'The current tools do not upload the files or text you choose to Utilark.',
      updated: '2026-08-12',
      notice:
        'This policy covers Utilark at utilark.app, including the contact form. Browser extensions, downloaded files, and third-party sites have their own policies.',
      sections: [
        {
          heading: 'Files and text used in tools',
          paragraphs: [
            'The tools run locally in your browser: image conversion and cropping, photo-to-PDF, word counting, PDF merging, reading text aloud, and the ladder game. Utilark does not receive, store, or review the files, text, and names you use in them.',
            'Reading text aloud has one exception that does not involve Utilark. Speech uses the voices your browser offers, and some browsers generate their higher-quality voices on their own servers rather than on your device. Choosing such a voice means your browser sends the text to its vendor to be spoken. The tool labels every voice as on device or network, lists on-device voices first, and warns before you play a network voice. Utilark neither receives nor can see that text either way.',
            'Cropping a photo, converting it, or placing it in a PDF redraws the image, which discards the metadata a camera stores in the file — including GPS coordinates. This happens on your device and is a side effect of the processing, not something Utilark collects.',
            'Closing or refreshing the page clears the tool state unless your browser itself retains form state. Downloaded results are saved wherever your browser is configured to save them.',
          ],
        },
        {
          heading: 'Technical access data',
          paragraphs: [
            'The hosting and security providers may process standard request information such as IP address, browser type, requested URL, time, and security signals. This information is used to deliver and protect the website and may be retained according to the provider configuration.',
            'Utilark keeps privacy-preserving daily usage totals for up to 90 days. To remove repeat visits from DAU, the date, connection IP address, and browser user-agent are converted into a keyed one-way daily value. The original values, individual browsing history, and cross-day visitor identifier are not stored in the Utilark analytics database. Known bots are excluded where Cloudflare signals or common automated user-agents identify them, and DNT or Global Privacy Control requests are not counted.',
            'An authenticated administrator can exclude the current browser from future counts. This setting uses the HttpOnly utilark_notrack cookie across utilark.app for up to five years, contains only the value 1, and is removed when the setting is turned off. It is not an advertising or cross-site tracking cookie.',
            'Choosing a language stores the utilark_lang cookie across utilark.app for up to one year so that the site and its short tool addresses open in the language you picked. It holds only the value en or ko and is not used for advertising or cross-site tracking.',
          ],
        },
        {
          heading: 'Contact messages',
          paragraphs: [
            'When you use the contact form, Utilark stores the message, category, language, submission time, status, and any reply email you choose to provide. A reply email is optional. Do not include sensitive information or attach private documents.',
            'Contact messages are used only to review and respond to the inquiry. They are available to the Utilark administrator at admin.utilark.app, are kept separately from Bubblelab data, and are automatically removed after 180 days unless deleted earlier.',
            'For abuse prevention, the service temporarily uses a keyed one-way value derived from the connection IP address. The original IP address is not stored in the contact database, and expired rate-limit records are removed automatically.',
          ],
        },
        {
          heading: 'Advertising and analytics',
          paragraphs: [
            'The daily usage totals described above are stored in Utilark infrastructure and are visible only to the Utilark administrator. No third-party analytics script is loaded.',
            'Utilark shows advertising supplied by Google AdSense. Google is a third-party vendor and, together with its partners, uses cookies or similar technologies to serve, personalize, and measure advertising based on your visits to Utilark and other websites.',
            'Where consent is required, including the European Economic Area, the United Kingdom, and Switzerland, a Google-certified consent message is shown before advertising cookies are used for personalization. You can reopen that notice to change or withdraw your choice at any time.',
            'You can turn off personalized advertising in Google Ads Settings, and you can opt out of third-party vendor cookies through the industry choice pages linked below. Turning personalization off does not remove advertising; it makes the advertising less specific to you.',
          ],
          links: [
            { label: 'How Google uses cookies in advertising', href: 'https://policies.google.com/technologies/ads' },
            { label: 'Google Ads Settings', href: 'https://myadcenter.google.com/' },
            { label: 'Digital Advertising Alliance opt-out', href: 'https://optout.aboutads.info/' },
            { label: 'Your Online Choices (EU)', href: 'https://www.youronlinechoices.eu/' },
          ],
        },
        {
          heading: 'Accounts, sales, and sensitive data',
          items: [
            'Utilark does not currently offer user accounts.',
            'Utilark does not currently sell products or collect payment details.',
            'A contact reply email is collected only when you choose to provide it.',
            'Do not enter sensitive information into a tool unless you are comfortable processing it on your own device.',
          ],
        },
        {
          heading: 'Who is responsible',
          paragraphs: [
            'Utilark is an independent project operated by the maintainer of the public utilark.app source repository. There is no parent company, and the service is not operated on behalf of Bubblelab.',
            'For a privacy question, a correction or deletion request about a contact message, or an advertising question, use the contact form. Replies go to the email address you choose to provide.',
          ],
          links: [
            { label: 'Contact form', href: '/en/contact/' },
            { label: 'Source repository', href: 'https://github.com/dohyeong-kim-95/util-ark' },
          ],
        },
        {
          heading: 'Policy changes',
          paragraphs: [
            'Material changes will be reflected on this page with a revised update date. A new server-side tool will receive a specific disclosure before release.',
          ],
        },
      ],
    },
    ko: {
      title: '개인정보 처리방침',
      description:
        'Utilark 이용 시 브라우저에서 처리되는 파일, 접속 기록, 광고 및 기타 데이터를 어떻게 다루는지 안내합니다.',
      lead: '현재 제공하는 도구는 사용자가 선택한 파일이나 글을 Utilark로 업로드하지 않습니다.',
      updated: '2026-08-12',
      notice:
        '이 방침은 문의 폼을 포함한 utilark.app의 Utilark 서비스에 적용됩니다. 브라우저 확장 기능, 내려받은 파일, 외부 사이트에는 각각의 정책이 적용됩니다.',
      sections: [
        {
          heading: '도구에서 사용하는 파일과 글',
          paragraphs: [
            '이미지 변환과 자르기, 사진 PDF 만들기, 글자수 계산, PDF 합치기, 텍스트 읽어주기, 사다리타기는 사용자의 브라우저에서 실행됩니다. Utilark는 이 도구에 넣은 파일, 글, 이름을 받거나 저장하거나 열람하지 않습니다.',
            '텍스트 읽어주기에는 Utilark와 무관한 예외가 하나 있습니다. 읽어주기는 브라우저가 제공하는 목소리를 쓰는데, 일부 브라우저는 고품질 목소리를 기기가 아니라 자사 서버에서 만들어 보냅니다. 그런 목소리를 고르면 **읽는 글이 브라우저 제조사로 전송됩니다.** 이 도구는 목소리마다 기기 내장·네트워크를 표시하고, 기기 내장 목소리를 먼저 보여주며, 네트워크 목소리를 재생하기 전에 알려줍니다. 어느 쪽이든 Utilark는 그 글을 받지도, 볼 수도 없습니다.',
            '사진을 자르거나 변환하거나 PDF에 넣으면 이미지를 다시 그리게 되며, 이 과정에서 카메라가 파일에 기록한 메타데이터가 사라집니다 — GPS 좌표도 포함됩니다. 사용자의 기기에서 일어나는 처리의 부수 효과이며 Utilark가 수집하는 것이 아닙니다.',
            '페이지를 닫거나 새로고침하면 브라우저 자체가 입력 상태를 복구하는 경우를 제외하고 도구 상태가 사라집니다. 결과 파일은 사용자의 브라우저에 설정된 위치에 저장됩니다.',
          ],
        },
        {
          heading: '기술적인 접속 정보',
          paragraphs: [
            '호스팅 및 보안 제공업체는 사이트 전송과 보호를 위해 IP 주소, 브라우저 종류, 요청 URL, 접속 시각, 보안 신호와 같은 일반적인 요청 정보를 처리할 수 있습니다. 보관 기간은 제공업체 설정에 따라 달라질 수 있습니다.',
            'Utilark는 개인정보 보호형 일별 이용 통계를 최대 90일간 보관합니다. DAU에서 당일 중복 방문을 제외하기 위해 날짜·접속 IP 주소·브라우저 User-Agent를 키가 적용된 일방향 일별 값으로 변환합니다. Utilark 분석 데이터베이스에는 원문 값, 개별 페이지 방문 기록, 날짜를 넘어 사용자를 연결하는 식별자를 저장하지 않습니다. Cloudflare 신호나 일반적인 자동화 User-Agent로 확인되는 봇은 제외하고, DNT 또는 Global Privacy Control 요청은 집계하지 않습니다.',
            '인증된 관리자는 현재 브라우저를 이후 집계에서 제외할 수 있습니다. 이 설정은 utilark.app 전체에서 최대 5년간 유지되는 HttpOnly utilark_notrack 쿠키를 사용하며 값 1만 담습니다. 설정을 끄면 쿠키를 삭제하며, 광고 또는 사이트 간 추적 쿠키로 사용하지 않습니다.',
            '언어를 선택하면 사이트와 짧은 도구 주소를 다시 열 때 같은 언어로 이동하도록 utilark.app 전체에서 최대 1년간 유지되는 utilark_lang 쿠키를 저장합니다. 이 쿠키는 en 또는 ko 값만 담으며 광고나 사이트 간 추적에 사용하지 않습니다.',
          ],
        },
        {
          heading: '문의 내용',
          paragraphs: [
            '문의 폼을 사용하면 문의 내용, 종류, 언어, 접수 시각, 처리 상태와 사용자가 선택적으로 제공한 답변용 이메일을 저장합니다. 이메일은 필수가 아닙니다. 민감정보나 비공개 문서는 보내지 마세요.',
            '문의 데이터는 문의 확인과 답변에만 사용합니다. admin.utilark.app의 Utilark 관리자만 확인할 수 있고 Bubblelab 데이터와 분리해 보관하며, 먼저 삭제하지 않더라도 180일 뒤 자동으로 삭제합니다.',
            '오남용 방지를 위해 접속 IP 주소에서 키가 적용된 단방향 값을 만들어 일시적으로 사용합니다. 문의 데이터베이스에 IP 주소 원문은 저장하지 않으며 기간이 지난 요청 제한 기록은 자동 삭제합니다.',
          ],
        },
        {
          heading: '광고와 분석',
          paragraphs: [
            '앞에서 설명한 일별 이용 통계는 Utilark 인프라에 저장되며 Utilark 관리자만 확인할 수 있습니다. 외부 분석 스크립트는 불러오지 않습니다.',
            'Utilark는 Google AdSense가 제공하는 광고를 게재합니다. Google은 제3자 광고 제공업체로서 파트너와 함께 쿠키 또는 유사 기술을 사용해 Utilark와 다른 웹사이트 방문 기록을 바탕으로 광고를 게재·맞춤 설정하고 성과를 측정합니다.',
            '유럽경제지역, 영국, 스위스 등 동의가 필요한 지역에서는 맞춤형 광고 쿠키를 사용하기 전에 Google 인증 동의 메시지를 표시합니다. 이 안내는 언제든 다시 열어 선택을 변경하거나 철회할 수 있습니다.',
            'Google 광고 설정에서 맞춤형 광고를 끌 수 있고, 아래 링크의 업계 공동 페이지에서 제3자 광고 쿠키 수신을 거부할 수 있습니다. 맞춤 설정을 끄더라도 광고가 사라지지는 않으며, 관련성이 낮은 광고가 표시됩니다.',
          ],
          links: [
            { label: 'Google 광고 쿠키 사용 안내', href: 'https://policies.google.com/technologies/ads' },
            { label: 'Google 광고 설정', href: 'https://myadcenter.google.com/' },
            { label: 'Digital Advertising Alliance 수신 거부', href: 'https://optout.aboutads.info/' },
            { label: 'Your Online Choices (EU)', href: 'https://www.youronlinechoices.eu/' },
          ],
        },
        {
          heading: '계정, 결제 및 민감정보',
          items: [
            '현재 Utilark는 사용자 계정을 제공하지 않습니다.',
            '현재 상품을 판매하거나 결제 정보를 수집하지 않습니다.',
            '문의 답변용 이메일은 사용자가 선택해서 제공한 경우에만 수집합니다.',
            '사용자 기기에서 직접 처리하더라도 민감정보는 필요성을 확인한 뒤 입력하세요.',
          ],
        },
        {
          heading: '운영 주체와 문의',
          paragraphs: [
            'Utilark는 공개된 utilark.app 소스 저장소를 관리하는 개인이 독립적으로 운영하는 프로젝트입니다. 모회사가 없으며 Bubblelab을 대신해 운영하지 않습니다.',
            '개인정보 관련 문의, 접수된 문의 내용의 정정·삭제 요청, 광고 관련 문의는 문의 폼을 이용해주세요. 답변은 사용자가 선택해 제공한 이메일 주소로 보냅니다.',
          ],
          links: [
            { label: '문의 폼', href: '/ko/contact/' },
            { label: '소스 저장소', href: 'https://github.com/dohyeong-kim-95/util-ark' },
          ],
        },
        {
          heading: '방침 변경',
          paragraphs: [
            '중요한 변경 사항은 이 페이지와 최종 업데이트 날짜에 반영합니다. 서버를 사용하는 새 도구는 공개 전에 별도의 데이터 처리 내용을 안내합니다.',
          ],
        },
      ],
    },
  },
  terms: {
    en: {
      title: 'Terms of Use',
      description: 'The basic terms, limitations, and user responsibilities for using Utilark tools.',
      lead: 'Use Utilark only for files and content you are authorized to process.',
      updated: '2026-08-12',
      sections: [
        {
          heading: 'Using the service',
          items: [
            'You may use the public tools for lawful personal or business tasks.',
            'Do not attempt to disrupt, overload, reverse engineer security controls, or misuse the service.',
            'Do not use Utilark to process content when doing so would violate another person’s rights or applicable law.',
          ],
        },
        {
          heading: 'Your files and results',
          paragraphs: [
            'You retain responsibility for the files you select and the results you download. Check important output before relying on it, especially for legal, financial, medical, archival, or production use.',
          ],
        },
        {
          heading: 'Access counts and privacy',
          paragraphs: [
            'Utilark may display approximate daily, weekly, and monthly visit totals. These figures exclude same-day repeats using the privacy-preserving method described in the Privacy Policy. Week and month figures add the daily totals and are not cross-day unique-user counts. They may differ from other analytics and must not be treated as audited measurements.',
            'Using the public service is subject to the data handling described in the Privacy Policy. Utilark does not require an account for the current browser tools, and the tool files or text remain on your device.',
          ],
        },
        {
          heading: 'Availability and warranties',
          paragraphs: [
            'Utilark is provided as available without a promise that every file, browser, or device will work. Features may change, pause, or be removed. To the extent permitted by law, Utilark is not liable for indirect loss caused by use of or inability to use a tool.',
          ],
        },
        {
          heading: 'Changes',
          paragraphs: [
            'These terms may be updated as the service changes. Continued use after an update means the revised terms apply from their stated date.',
          ],
        },
      ],
    },
    ko: {
      title: '이용약관',
      description: 'Utilark 도구 이용에 적용되는 기본 조건, 제한 및 사용자의 책임을 안내합니다.',
      lead: '처리할 권한이 있는 파일과 콘텐츠에만 Utilark를 사용해주세요.',
      updated: '2026-08-12',
      sections: [
        {
          heading: '서비스 이용',
          items: [
            '공개된 도구를 합법적인 개인 또는 업무 용도로 이용할 수 있습니다.',
            '서비스 방해, 과도한 부하 유발, 보안 통제 우회 또는 악의적인 이용을 해서는 안 됩니다.',
            '다른 사람의 권리나 관련 법률을 위반하는 콘텐츠 처리에 Utilark를 이용해서는 안 됩니다.',
          ],
        },
        {
          heading: '파일과 결과물',
          paragraphs: [
            '선택한 파일과 내려받은 결과물에 대한 책임은 사용자에게 있습니다. 법률, 금융, 의료, 보관 또는 실제 운영에 사용하기 전에는 중요한 결과를 반드시 확인하세요.',
          ],
        },
        {
          heading: '접속 수와 개인정보 보호',
          paragraphs: [
            'Utilark는 대략적인 일간·주간·월간 방문 수를 표시할 수 있습니다. 개인정보 처리방침에 설명한 보호 방식으로 같은 날의 중복 방문을 제외합니다. 주·월 수치는 일별 수치를 더한 값이며, 날짜를 넘어 같은 사용자를 식별한 순사용자 수가 아닙니다. 다른 분석 자료와 차이가 날 수 있고 감사된 공식 수치로 보아서는 안 됩니다.',
            '공개 서비스 이용에는 개인정보 처리방침에 안내한 데이터 처리가 적용됩니다. 현재 브라우저 도구는 계정을 요구하지 않으며, 도구에 넣은 파일과 글은 사용자의 기기에만 머뭅니다.',
          ],
        },
        {
          heading: '서비스 제공 및 보증',
          paragraphs: [
            'Utilark는 모든 파일, 브라우저 또는 기기에서 항상 작동한다고 보증하지 않으며 현재 제공 가능한 상태로 서비스합니다. 기능은 변경·중단·삭제될 수 있습니다. 법이 허용하는 범위에서 도구 이용 또는 이용 불가로 발생한 간접 손실에 책임을 지지 않습니다.',
          ],
        },
        {
          heading: '약관 변경',
          paragraphs: [
            '서비스 변화에 따라 약관을 갱신할 수 있습니다. 갱신 후 계속 이용하면 표시된 시행일부터 변경된 약관이 적용됩니다.',
          ],
        },
      ],
    },
  },
  contact: {
    en: {
      title: 'Contact',
      description: 'Send Utilark a bug report, tool suggestion, or service feedback through the private contact form.',
      lead: 'Report a bug, suggest a tool, or share feedback without posting it publicly.',
      updated: '2026-08-12',
      sections: [
        {
          heading: 'Bugs and suggestions',
          paragraphs: [
            'Open a GitHub issue with the affected page, browser, device, and steps to reproduce the problem. Do not attach private documents or paste personal information into a public issue.',
          ],
        },
        {
          heading: 'Security reports',
          paragraphs: [
            'Do not publish an exploitable security issue. Use the repository’s private security advisory reporting channel when it is available.',
          ],
        },
        {
          heading: 'Links',
          items: [
            'Issues: github.com/dohyeong-kim-95/util-ark/issues',
            'Source: github.com/dohyeong-kim-95/util-ark',
          ],
        },
      ],
    },
    ko: {
      title: '문의',
      description: '비공개 문의 폼으로 Utilark 오류를 제보하고 새 도구를 제안하거나 서비스 의견을 전달할 수 있습니다.',
      lead: '공개 게시글을 남기지 않고 오류를 제보하거나 새 도구와 서비스 의견을 보내주세요.',
      updated: '2026-08-12',
      sections: [
        {
          heading: '오류 제보와 제안',
          paragraphs: [
            'GitHub 이슈에 문제가 발생한 페이지, 브라우저, 기기, 재현 방법을 적어주세요. 공개 이슈에 비공개 문서를 첨부하거나 개인정보를 붙여 넣지 마세요.',
          ],
        },
        {
          heading: '보안 제보',
          paragraphs: [
            '악용 가능한 보안 문제를 공개 이슈에 작성하지 마세요. 저장소에서 비공개 보안 권고 제보 기능을 제공하면 해당 경로를 이용해주세요.',
          ],
        },
        {
          heading: '바로가기',
          items: [
            '이슈: github.com/dohyeong-kim-95/util-ark/issues',
            '소스: github.com/dohyeong-kim-95/util-ark',
          ],
        },
      ],
    },
  },
};
