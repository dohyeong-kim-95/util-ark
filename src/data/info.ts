import type { Locale } from '../i18n/ui';

export type InfoPageKind = 'about' | 'privacy' | 'terms' | 'contact';

type Section = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
};

export type InfoCopy = {
  title: string;
  description: string;
  lead: string;
  notice?: string;
  sections: Section[];
};

export const infoPages: Record<InfoPageKind, Record<Locale, InfoCopy>> = {
  about: {
    en: {
      title: 'About Utilark',
      description:
        'Learn why Utilark builds small, focused browser tools with clear privacy boundaries and bilingual support.',
      lead: 'Utilark is an independent collection of practical tools for small, everyday tasks.',
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
      ],
    },
    ko: {
      title: 'Utilark 소개',
      description:
        'Utilark가 명확한 개인정보 보호 기준과 한·영 지원을 갖춘 작은 브라우저 도구를 만드는 이유를 소개합니다.',
      lead: 'Utilark는 일상의 작은 작업을 해결하는 실용적인 도구 모음입니다.',
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
      ],
    },
  },
  privacy: {
    en: {
      title: 'Privacy Policy',
      description:
        'How Utilark handles browser-processed files, access logs, advertising, and other data when you use the service.',
      lead: 'The current tools do not upload the files or text you choose to Utilark.',
      notice:
        'This policy covers Utilark at utilark.app. Browser extensions, downloaded files, and third-party sites have their own policies.',
      sections: [
        {
          heading: 'Files and text used in tools',
          paragraphs: [
            'Image conversion, word counting, and PDF merging run locally in your browser. Utilark does not receive, store, or review the files and text you use in these tools.',
            'Closing or refreshing the page clears the tool state unless your browser itself retains form state. Downloaded results are saved wherever your browser is configured to save them.',
          ],
        },
        {
          heading: 'Technical access data',
          paragraphs: [
            'The hosting and security providers may process standard request information such as IP address, browser type, requested URL, time, and security signals. This information is used to deliver and protect the website and may be retained according to the provider configuration.',
          ],
        },
        {
          heading: 'Advertising and analytics',
          paragraphs: [
            'Utilark does not load advertising code in the initial release. If advertising is enabled later, this policy and the consent experience will be updated before personalized advertising is used where consent is required.',
            'Google AdSense or another advertising provider may use cookies or similar technologies and process device and interaction information. You will be able to review the relevant provider policy from the consent notice.',
          ],
        },
        {
          heading: 'Accounts, sales, and sensitive data',
          items: [
            'Utilark does not currently offer user accounts.',
            'Utilark does not currently sell products or collect payment details.',
            'Do not enter sensitive information into a tool unless you are comfortable processing it on your own device.',
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
      notice:
        '이 방침은 utilark.app의 Utilark 서비스에 적용됩니다. 브라우저 확장 기능, 내려받은 파일, 외부 사이트에는 각각의 정책이 적용됩니다.',
      sections: [
        {
          heading: '도구에서 사용하는 파일과 글',
          paragraphs: [
            '이미지 변환, 글자수 계산, PDF 합치기는 사용자의 브라우저에서 실행됩니다. Utilark는 이 도구에 넣은 파일이나 글을 받거나 저장하거나 열람하지 않습니다.',
            '페이지를 닫거나 새로고침하면 브라우저 자체가 입력 상태를 복구하는 경우를 제외하고 도구 상태가 사라집니다. 결과 파일은 사용자의 브라우저에 설정된 위치에 저장됩니다.',
          ],
        },
        {
          heading: '기술적인 접속 정보',
          paragraphs: [
            '호스팅 및 보안 제공업체는 사이트 전송과 보호를 위해 IP 주소, 브라우저 종류, 요청 URL, 접속 시각, 보안 신호와 같은 일반적인 요청 정보를 처리할 수 있습니다. 보관 기간은 제공업체 설정에 따라 달라질 수 있습니다.',
          ],
        },
        {
          heading: '광고와 분석',
          paragraphs: [
            '초기 공개판에는 광고 코드를 불러오지 않습니다. 나중에 광고를 활성화하면 동의가 필요한 지역에서 맞춤형 광고를 사용하기 전에 이 방침과 동의 절차를 갱신합니다.',
            'Google AdSense 또는 다른 광고 제공업체는 쿠키나 유사 기술을 사용하고 기기·이용 정보를 처리할 수 있습니다. 동의 안내에서 해당 제공업체의 정책을 확인할 수 있도록 합니다.',
          ],
        },
        {
          heading: '계정, 결제 및 민감정보',
          items: [
            '현재 Utilark는 사용자 계정을 제공하지 않습니다.',
            '현재 상품을 판매하거나 결제 정보를 수집하지 않습니다.',
            '사용자 기기에서 직접 처리하더라도 민감정보는 필요성을 확인한 뒤 입력하세요.',
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
      description: 'Report a Utilark bug, suggest a tool, or send security feedback through the public repository.',
      lead: 'The public GitHub repository is the current contact channel for Utilark.',
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
      description: '공개 저장소에서 Utilark 오류를 제보하고 새 도구를 제안하거나 보안 의견을 전달할 수 있습니다.',
      lead: '현재 Utilark의 공식 문의 창구는 공개 GitHub 저장소입니다.',
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
