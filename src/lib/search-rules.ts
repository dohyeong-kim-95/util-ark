/**
 * Landing-page search. Rule based — no server, no index build, no fuzzy library.
 * Every rule has a fixed score, and the rule that scored highest is named in the
 * result so a surprising hit explains itself.
 *
 * Ported from bubblelab's `_shared/search-rules.js`, which the same author runs
 * on bubblelab.dev. The rules are the same; the fields and the synonym table are
 * Utilark's, because the things being searched are tools and guides rather than
 * toy cards. Kept free of DOM and Node APIs so the browser bundle and the Node
 * test can share it.
 *
 * Rules, strongest first:
 *   exact    "png to jpg"  → PNG to JPG
 *   prefix   "사진 자"     → 사진 자르기
 *   part     "자르"        → 사진 자르기
 *   chosung  "ㅅㅈㅈㄹㄱ"  → 사진 자르기        (initials only)
 *   jamo     "사진 자르ㄱ" → 사진 자르기        (one keystroke short)
 *   layout   "tkwls"       → 사진               (typed without switching IME)
 *   synonym  "크롭"        → 사진 자르기        (the table below)
 */

export type SearchEntry = {
  /** Localized display name — what the card shows. */
  title: string;
  /** URL path segment, always English, so `png-to-jpg` is findable from Korean. */
  name: string;
  /** One-line description shown under the title. */
  desc: string;
  /** The page's own keyword list, reused as search terms. */
  keywords?: string[];
  url: string;
  icon: string;
  accent: string;
  /** Localized group label: tool, converter, guide. */
  kind: string;
  /** Localized call to action, since a guide is read rather than opened. */
  action: string;
};

export type SearchHit = {
  entry: SearchEntry;
  score: number;
  rule: RuleId;
  label: string;
};

export type RuleId = 'exact' | 'prefix' | 'part' | 'chosung' | 'jamo' | 'layout' | 'synonym';

/**
 * The label is read by a visitor, not by a developer, so it says what the search
 * did — "초성으로 찾음", not the category name "초성 일치". Kept to a few
 * characters because it sits on a card that is 180px wide on a phone.
 */
export const RULES: Array<{ id: RuleId; ko: string; en: string; score: number }> = [
  { id: 'exact', ko: '이름이 같음', en: 'by exact name', score: 100 },
  { id: 'prefix', ko: '이름 앞부분', en: 'by name start', score: 76 },
  { id: 'part', ko: '이름 속 단어', en: 'by name', score: 58 },
  { id: 'chosung', ko: '초성으로 찾음', en: 'by initials', score: 46 },
  { id: 'jamo', ko: '자모로 찾음', en: 'by partial jamo', score: 40 },
  { id: 'layout', ko: '한영 오타로 찾음', en: 'by layout typo', score: 34 },
  { id: 'synonym', ko: '비슷한 뜻으로 찾음', en: 'by meaning', score: 30 },
];
const ruleOf = (id: RuleId) => RULES.find((rule) => rule.id === id)!;
const scoreOf = (id: RuleId) => ruleOf(id).score;

/** The name is the thing being searched for; keywords and description assist. */
const FIELDS: Array<{ key: keyof SearchEntry; weight: number }> = [
  { key: 'title', weight: 1 },
  { key: 'name', weight: 0.95 },
  // Below `title`'s "contains" score on purpose: a page named for the thing
  // beats a page that merely lists it as a keyword. Without that, "convert"
  // put six pair pages above the converter itself.
  { key: 'keywords', weight: 0.7 },
  { key: 'desc', weight: 0.6 },
];

/**
 * The one hand-kept table, for words that appear in neither the title nor the
 * slug. Titles and keywords are indexed automatically, so adding a tool needs no
 * edit here — only "I want this word to find it too" does.
 */
export const SYNONYMS: string[][] = [
  ['이미지', 'image', '사진', 'photo', 'picture', 'pic'],
  ['변환', 'convert', 'converter', '컨버터', '바꾸기', '변경', '확장자'],
  ['자르기', 'crop', '크롭', '잘라내기', '트리밍', 'trim', '오려내기'],
  ['증명사진', 'id photo', '여권사진', 'passport photo', '반명함'],
  ['pdf', '피디에프', '문서', 'document'],
  ['합치기', 'merge', '병합', 'combine', '붙이기', '하나로'],
  ['글자수', 'word count', 'character count', '자소서', '글자 수 세기', '카운터', '띄어쓰기'],
  ['읽어주기', 'read aloud', 'tts', '음성', 'speech', '낭독', '듣기', '소리'],
  ['사다리', 'ladder', '사다리타기', '제비뽑기', '뽑기', '랜덤', 'random'],
  ['용량', 'compress', '압축', '줄이기', 'size'],
  ['투명', 'transparent', 'transparency', '알파', 'alpha'],
  ['가이드', 'guide', '설명', '방법', 'how to', '튜토리얼'],
];

/* ---------- normalization ---------- */
/** Drops case, spacing and separators, so `png-to-jpg` equals `png to jpg`. */
export function normalize(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[\s·‧|—–\-_/\\,.()[\]{}!?'"“”‘’:;+&]+/gu, '');
}

const CHO = [...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'];
const JUNG = [...'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'];
const JONG = ['', ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'];
/** Compound vowels and final clusters unfold into the two keys that type them. */
const SPLIT: Record<string, string> = {
  ㅘ: 'ㅗㅏ', ㅙ: 'ㅗㅐ', ㅚ: 'ㅗㅣ', ㅝ: 'ㅜㅓ', ㅞ: 'ㅜㅔ', ㅟ: 'ㅜㅣ', ㅢ: 'ㅡㅣ',
  ㄳ: 'ㄱㅅ', ㄵ: 'ㄴㅈ', ㄶ: 'ㄴㅎ', ㄺ: 'ㄹㄱ', ㄻ: 'ㄹㅁ', ㄼ: 'ㄹㅂ', ㄽ: 'ㄹㅅ',
  ㄾ: 'ㄹㅌ', ㄿ: 'ㄹㅍ', ㅀ: 'ㄹㅎ', ㅄ: 'ㅂㅅ',
};
const offset = (ch: string) => (ch.codePointAt(0) ?? 0) - 0xac00;
const isSyllable = (n: number) => n >= 0 && n < 11172;

/** Keeps only the leading consonants: 사진 자르기 → ㅅㅈㅈㄹㄱ */
export function chosungOf(value: unknown): string {
  let out = '';
  for (const ch of String(value ?? '')) {
    const n = offset(ch);
    if (isSyllable(n)) out += CHO[Math.floor(n / 588)];
    else if (/[ㄱ-ㅎ]/u.test(ch)) out += ch;
    // Latin and digits are dropped — an initials query aims at Hangul only.
  }
  return out;
}
const isChosungQuery = (q: string) => q.length > 0 && /^[ㄱ-ㅎ]+$/u.test(q);

/**
 * Unfolds syllables into the jamo sequence that types them: 사진 → ㅅㅏㅈㅣㄴ.
 * Because it matches keystroke order, a half-typed query compares directly.
 */
export function jamoOf(value: unknown): string {
  let out = '';
  for (const ch of String(value ?? '')) {
    const n = offset(ch);
    if (!isSyllable(n)) { out += SPLIT[ch] ?? ch; continue; }
    const jung = JUNG[Math.floor((n % 588) / 28)];
    const jong = JONG[n % 28];
    out += CHO[Math.floor(n / 588)] + (SPLIT[jung] ?? jung) + (SPLIT[jong] ?? jong);
  }
  return out;
}

/** Dubeolsik layout, for a Korean word typed with the IME still in English. */
const KEYS: Record<string, string> = {
  q: 'ㅂ', w: 'ㅈ', e: 'ㄷ', r: 'ㄱ', t: 'ㅅ', y: 'ㅛ', u: 'ㅕ', i: 'ㅑ', o: 'ㅐ', p: 'ㅔ',
  a: 'ㅁ', s: 'ㄴ', d: 'ㅇ', f: 'ㄹ', g: 'ㅎ', h: 'ㅗ', j: 'ㅓ', k: 'ㅏ', l: 'ㅣ',
  z: 'ㅋ', x: 'ㅌ', c: 'ㅊ', v: 'ㅍ', b: 'ㅠ', n: 'ㅜ', m: 'ㅡ',
  Q: 'ㅃ', W: 'ㅉ', E: 'ㄸ', R: 'ㄲ', T: 'ㅆ', O: 'ㅒ', P: 'ㅖ',
};
/** Empty when there was no Latin at all — a signal to skip the rule. */
export function layoutJamo(value: unknown): string {
  let out = '';
  let hit = 0;
  for (const ch of String(value ?? '')) {
    if (KEYS[ch]) { out += KEYS[ch]; hit += 1; } else out += ch;
  }
  return hit ? out : '';
}

/* ---------- one field against one word ---------- */
function baseRule(field: string, q: string): RuleId | null {
  if (!field || !q) return null;
  if (field === q) return 'exact';
  if (field.startsWith(q)) return 'prefix';
  if (field.includes(q)) return 'part';
  return null;
}

/** A keyword list scores as its best single entry, not as one joined string. */
function fieldValues(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [String(value ?? '')];
}

function matchField(raw: unknown, token: string): RuleId | null {
  const q = normalize(token);
  if (!q) return null;

  let best: RuleId | null = null;
  for (const value of fieldValues(raw)) {
    const field = normalize(value);
    if (!field) continue;
    const hit =
      baseRule(field, q) ??
      (isChosungQuery(q) && chosungOf(value).includes(q) ? 'chosung' : null) ??
      (jamoOf(field).includes(jamoOf(q)) ? 'jamo' : null) ??
      layoutHit(field, token);
    if (hit && (!best || scoreOf(hit) > scoreOf(best))) best = hit;
  }
  return best;
}

function layoutHit(field: string, token: string): RuleId | null {
  const typed = layoutJamo(token);
  if (!typed) return null;
  return jamoOf(field).includes(jamoOf(normalize(typed))) ? 'layout' : null;
}

/**
 * Related words: search again with the other words in the query's group, at half
 * score. Short words (two characters or fewer) are held to exact and prefix
 * matches only — otherwise "pdf" inside a longer word drags in the wrong page.
 */
function synonymScore(entry: SearchEntry, token: string): number {
  const q = normalize(token);
  let best = 0;
  for (const group of SYNONYMS) {
    if (!group.some((word) => normalize(word) === q)) continue;
    for (const word of group) {
      const term = normalize(word);
      if (term === q) continue;
      for (const { key, weight } of FIELDS) {
        for (const value of fieldValues(entry[key])) {
          const rule = baseRule(normalize(value), term);
          if (!rule || (rule === 'part' && term.length < 3)) continue;
          best = Math.max(best, scoreOf(rule) * weight * 0.5);
        }
      }
    }
  }
  return best;
}

function scoreToken(entry: SearchEntry, token: string): { score: number; rule: RuleId | null } {
  let best = 0;
  let rule: RuleId | null = null;
  for (const { key, weight } of FIELDS) {
    const hit = matchField(entry[key], token);
    if (!hit) continue;
    const score = scoreOf(hit) * weight;
    if (score > best) { best = score; rule = hit; }
  }
  const bySynonym = synonymScore(entry, token);
  if (bySynonym > best) { best = bySynonym; rule = 'synonym'; }
  return { score: best, rule };
}

/**
 * Space-separated words must **all** match, so "png 변환" narrows rather than
 * widening. Ties break on the shorter name, then alphabetically, so the same
 * query always produces the same order.
 */
export function searchEntries(
  entries: SearchEntry[],
  query: string,
  { limit = 24, locale = 'ko' as 'ko' | 'en' } = {},
): SearchHit[] {
  const tokens = String(query ?? '').trim().split(/\s+/u).filter(Boolean);
  if (!tokens.length) return [];

  const hits: SearchHit[] = [];
  for (const entry of entries) {
    let sum = 0;
    let best = 0;
    let rule: RuleId | null = null;
    let all = true;
    for (const token of tokens) {
      const got = scoreToken(entry, token);
      if (!got.score) { all = false; break; }
      sum += got.score;
      if (got.score > best) { best = got.score; rule = got.rule; }
    }
    if (!all || !rule) continue;

    let score = sum / tokens.length;
    // Word order carries meaning here. "png to jpg" and "jpg to png" hold the
    // same three words, so per-word scoring cannot separate them and the tie
    // fell to whichever slug sorted first — half the time the wrong direction.
    // Scoring the whole phrase as well breaks it: spacing is normalized away,
    // so "png to jpg" is the `png-to-jpg` slug exactly and nothing else.
    if (tokens.length > 1) {
      const phrase = scoreToken(entry, tokens.join(''));
      if (phrase.rule && phrase.score > score) { score = phrase.score; rule = phrase.rule; }
    }

    hits.push({ entry, score, rule, label: ruleOf(rule)[locale] });
  }

  hits.sort((a, b) =>
    b.score - a.score ||
    a.entry.title.length - b.entry.title.length ||
    a.entry.name.localeCompare(b.entry.name, locale));
  return hits.slice(0, limit);
}
