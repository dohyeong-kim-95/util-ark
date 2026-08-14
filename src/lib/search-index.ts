import { conversions } from '../data/conversions';
import { guides } from '../data/guides';
import { tools } from '../data/tools';
import type { Locale } from '../i18n/ui';
import type { SearchEntry } from './search-rules';

/**
 * Everything on the site that has a page of its own, in one flat list. Built at
 * build time and shipped inside the landing page, because the whole index is a
 * few kilobytes — smaller than the request that would fetch it.
 */
export function searchIndex(locale: Locale): SearchEntry[] {
  const kind = locale === 'ko'
    ? { tool: '도구', convert: '이미지 변환', guide: '가이드' }
    : { tool: 'Tool', convert: 'Image converter', guide: 'Guide' };

  return [
    ...tools.map((tool): SearchEntry => ({
      title: tool.copy[locale].name,
      name: tool.slug,
      desc: tool.copy[locale].short,
      keywords: tool.copy[locale].keywords,
      url: `/${locale}/${tool.slug}/`,
      icon: tool.icon,
      accent: tool.accent,
      kind: kind.tool,
    })),
    ...conversions.map((pair): SearchEntry => ({
      title: pair.copy[locale].name,
      name: pair.slug,
      desc: pair.copy[locale].short,
      keywords: pair.copy[locale].keywords,
      url: `/${locale}/${pair.slug}/`,
      icon: pair.icon,
      accent: pair.accent,
      kind: kind.convert,
    })),
    ...guides.map((guide): SearchEntry => ({
      title: guide.copy[locale].title,
      name: guide.slug,
      desc: guide.copy[locale].description,
      url: `/${locale}/guides/${guide.slug}/`,
      icon: '❯',
      accent: '#8aa1ff',
      kind: kind.guide,
    })),
  ];
}
