export const locales = ['en', 'ko'] as const;

export type Locale = (typeof locales)[number];

export const isLocale = (value: string | undefined): value is Locale =>
  value === 'en' || value === 'ko';

export const otherLocale = (locale: Locale): Locale => (locale === 'en' ? 'ko' : 'en');

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
};

export const ui = {
  en: {
    brandTagline: 'Small tools. Clear results.',
    nav: {
      tools: 'Tools',
      guides: 'Guides',
      about: 'About',
      privacy: 'Privacy',
      contact: 'Contact',
    },
    home: {
      eyebrow: 'PRIVATE BY DEFAULT',
      title: 'Useful tools without the upload anxiety.',
      description:
        'Convert images, count words, and work with PDFs directly in your browser. No account required.',
      primary: 'Browse tools',
      privacyTitle: 'Your files stay on your device',
      privacyBody:
        'The tools in this first release process your files and text locally in the browser. Utilark does not upload or store them.',
      toolsTitle: 'Available now',
      toolsDescription: 'Focused tools that do one job well, on desktop and mobile.',
    },
    common: {
      openTool: 'Open tool',
      howItWorks: 'How it works',
      faq: 'Frequently asked questions',
      localBadge: 'Runs in your browser',
      breadcrumbHome: 'Home',
      breadcrumbTools: 'Tools',
      language: '한국어',
      adLabel: 'Advertisement',
      breadcrumbGuides: 'Guides',
      moreTools: 'More Utilark tools',
      relatedGuides: 'Read more about this',
      guidesTitle: 'Guides',
      guidesDescription: 'Longer answers to the questions the tools raise.',
      readGuide: 'Read guide',
      lastUpdated: 'Last updated:',
    },
    footer: {
      note: 'Practical browser tools, built with privacy in mind.',
      terms: 'Terms',
      source: 'Source code',
    },
  },
  ko: {
    brandTagline: '작은 도구, 분명한 결과.',
    nav: {
      tools: '도구',
      guides: '가이드',
      about: '소개',
      privacy: '개인정보',
      contact: '문의',
    },
    home: {
      eyebrow: '처음부터 개인정보 보호',
      title: '업로드 걱정 없이 쓰는 일상 도구.',
      description:
        '이미지 변환, 글자수 계산, PDF 작업을 브라우저에서 바로 처리하세요. 회원가입이 필요 없습니다.',
      primary: '도구 둘러보기',
      privacyTitle: '파일은 사용자의 기기에만 머뭅니다',
      privacyBody:
        '첫 공개판의 도구는 파일과 글을 브라우저 안에서 처리합니다. Utilark 서버로 업로드하거나 저장하지 않습니다.',
      toolsTitle: '지금 사용할 수 있어요',
      toolsDescription: '데스크톱과 모바일에서 한 가지 일을 확실히 처리하는 도구들입니다.',
    },
    common: {
      openTool: '도구 열기',
      howItWorks: '사용 방법',
      faq: '자주 묻는 질문',
      localBadge: '브라우저에서 처리',
      breadcrumbHome: '홈',
      breadcrumbTools: '도구',
      language: 'English',
      adLabel: '광고',
      breadcrumbGuides: '가이드',
      moreTools: '다른 Utilark 도구',
      relatedGuides: '더 알아보기',
      guidesTitle: '가이드',
      guidesDescription: '도구를 쓰다 생기는 질문에 대한 더 긴 답입니다.',
      readGuide: '가이드 읽기',
      lastUpdated: '최종 업데이트:',
    },
    footer: {
      note: '개인정보 보호를 고려해 만든 실용적인 브라우저 도구입니다.',
      terms: '이용약관',
      source: '소스 코드',
    },
  },
} as const;

export function switchLocalePath(pathname: string, locale: Locale): string {
  const target = otherLocale(locale);
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return normalized.replace(/^\/(en|ko)(?=\/)/, `/${target}`);
}
