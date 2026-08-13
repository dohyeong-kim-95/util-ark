# 구글 검색 동작 방식 정리

원문: [In-Depth Guide to How Google Search Works](https://developers.google.com/search/docs/fundamentals/how-search-works?hl=ko) · 정리일: 2026-08-13

## 근거 수준

**원문 전체를 읽지는 못했습니다.** 조사 환경에서 `developers.google.com`이 egress 차단(`EGRESS_BLOCKED`)이라, 검색 결과가 원문에서 직접 인용한 문장을 근거로 정리했습니다. 인용부호 안의 문장은 그렇게 확보한 것이고, 그 밖의 서술과 이 저장소에 대한 해석은 제 정리입니다. 정확한 문구가 필요하면 브라우저에서 원문을 직접 보세요.

`docs/seo-research.md`와 같은 제약이며, 근거 수준을 표시하는 관행도 같습니다.

## 세 단계

구글 검색은 **크롤링 → 색인 생성 → 검색 결과 게재** 세 단계로 동작합니다. 세 단계 모두 통과해야 검색에 나옵니다. 앞 단계에서 막히면 뒷 단계는 일어나지 않습니다.

### 1. 크롤링 — 페이지가 존재한다는 걸 알아내는 단계

크롤러가 페이지의 텍스트·이미지·동영상을 내려받습니다. 그 전에 **URL을 발견**해야 하는데, 원문은 이 지점을 이렇게 설명합니다.

> "There isn't a central registry of all web pages, so Google must constantly look for new and updated pages and add them to its list of known pages. This process is called **URL discovery**."

> "Googlebot discovers new URLs to crawl **primarily from links embedded in previously crawled pages**."

**모든 웹페이지의 중앙 등록소가 없다**는 것이 핵심입니다. 구글은 이미 크롤링한 페이지에 걸린 링크를 따라가며 새 URL을 찾습니다. 즉 **아무도 링크를 걸어주지 않은 새 도메인은 구글이 존재 자체를 모릅니다.**

이것이 2026-08-13에 `utilark app`으로 검색해도 이 사이트가 나오지 않은 이유입니다. `robots.txt`도 사이트맵도 정상이었고 `noindex`도 없었습니다. 순위 문제가 아니라 **발견 단계에 진입하지 못한 상태**였습니다. 그래서 남는 경로는 두 가지입니다.

- 다른 사이트가 링크를 걸어준다 (시간이 걸리고 통제할 수 없음)
- **사이트맵과 Search Console로 직접 알린다** (즉시 가능)

### 2. 색인 생성 — 무엇에 관한 페이지인지 파악하는 단계

> "Indexing includes processing and analyzing the textual content and key content tags and attributes, such as `<title>` elements and alt attributes, images, videos, and more."

`<title>`이 색인 단계에서 분석되는 요소로 **명시적으로 거론**됩니다. `ToolCopy.titleTag`를 도입해 `PDF 합치기 · Utilark`를 `PDF 합치기 - 무료 온라인 PDF 병합 | Utilark`로 바꾼 작업이 여기에 해당합니다.

이 단계에서 **정규화(canonicalization)**도 일어납니다.

> "During indexing, Google **determines if a page is a duplicate or canonical**, with the canonical being the page that may be shown in search results."

같은 내용의 페이지들을 묶어 그중 하나를 대표로 고르고, 검색 결과에는 그 대표만 나옵니다. 이 저장소의 설계 중 여기에 맞물리는 것들:

- 모든 페이지에 `canonical`과 `hreflang`이 있습니다 (`BaseLayout.astro`, `npm test`가 검사)
- **서브도메인이 자체 콘텐츠를 서빙하지 않습니다.** 11개 호스트가 각각 사이트 사본을 갖고 있으면 전부 중복 후보가 됩니다. 진입점으로만 쓰고 apex로 리다이렉트하는 이유입니다 (`docs/subdomains.md`)
- 서브도메인의 루트가 아닌 경로를 apex로 301 보내는 규칙도 같은 이유입니다
- 옛 `/{언어}/tools/{슬러그}/`를 새 주소로 301 보냅니다. 두 주소가 같은 내용을 서빙하면 중복이 됩니다

**렌더링**도 이 단계입니다.

> "Rendering is important because websites often rely on JavaScript to bring content to the page, and **without rendering Google might not see that content**."

Utilark는 Astro `output: 'static'`이라 도구 설명·사용 방법·FAQ가 **빌드 시점에 HTML로 들어갑니다.** 자바스크립트는 도구 동작에만 쓰입니다. 렌더링을 기다려야 보이는 콘텐츠가 아니라는 뜻이고, 이 구조에서는 위 위험이 적습니다. 다만 도구 UI 자체는 JS라, **검색에 걸릴 내용은 앞으로도 HTML에 있어야 합니다.**

관련해서 상태 코드도 걸립니다.

> "Only HTTP status code 200 pages can get clustered."

리다이렉트와 오류 페이지는 색인 대상이 아닙니다. 서브도메인 진입점(302)과 옛 경로(301)가 색인되지 않고 도착지만 색인되는 것이 의도한 동작입니다.

### 3. 게재 — 질의에 답하는 단계

> "When a user enters a query, machines search the index for matching pages and return the results believed to be the **highest quality and most relevant** to the user's query."

관련성 외에 사용자의 **언어·위치·기기**도 반영됩니다. 한국어 사용자에게는 한국어 페이지가 우선됩니다. `hreflang`으로 `en`/`ko`/`x-default`를 선언해 두는 이유이고, 한국어 시장에 집중하기로 한 판단(`todo.md`)과도 맞물립니다.

## 원문이 못 박아 둔 것

> "Google **doesn't guarantee** that it will crawl, index, or serve your page, **even if your page follows the Google Search Essentials**."

기술 요건을 다 갖춰도 크롤링·색인·게재는 보장되지 않습니다. 다만 요건을 지킨 사이트가 **노출될 가능성이 높다**는 것이 문서의 입장입니다.

실무적으로 이렇게 읽어야 합니다.

- `npm test`가 통과했다고 색인된 것이 아닙니다. 통과는 **막는 게 없다**는 뜻일 뿐입니다.
- 색인은 요청한다고 즉시 되지 않습니다. 며칠에서 몇 주가 걸립니다.
- 색인이 안 됐다고 사이트가 고장 난 것도 아닙니다. 원인은 대개 발견·중복·품질 중 하나이지 오류가 아닙니다.

## 네이버는 별개다

네이버는 구글 색인을 쓰지 않고 자체 색인을 운영합니다. **Search Console 등록은 네이버 노출에 아무 영향을 주지 않습니다.** 조사한 키워드(`글자수 세기`·`PDF 합치기`·`사다리타기`)는 국내 검색 비중이 크므로 [네이버 서치어드바이저](https://searchadvisor.naver.com)에 따로 등록해야 합니다. `todo.md`에 항목이 있습니다.

## 이 문서로 정리되는 것

| 단계 | 이 저장소가 이미 한 것 | 사람이 해야 하는 것 |
|---|---|---|
| 크롤링 | `robots.txt` `Allow: /`, 사이트맵 18개 URL | Search Console 제출 · 네이버 등록 |
| 색인 생성 | `canonical`·`hreflang`·`titleTag`, 정적 HTML, 서브도메인 리다이렉트, 옛 경로 301 | 색인 생성 요청 |
| 게재 | 로케일별 페이지, 도구 키워드 제목, 도구 간 상호 링크 | 콘텐츠 확충 (`todo.md`) |
