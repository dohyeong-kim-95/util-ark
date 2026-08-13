# 도구 키워드 상위노출 리서치

조사일: 2026-08-13 · 대상: Utilark가 이미 가진 도구와 직접 겹치는 키워드

## 조사 방법과 한계

이 문서는 **검색 결과의 제목·URL·스니펫**만 근거로 합니다. 조사 환경에서 외부 도메인 본문 접근(WebFetch)이 차단되어 있어 경쟁 페이지의 **본문 분량, 제목 태그 원문, H2 구조, 내부 링크, 구조화 데이터는 확인하지 못했습니다.**

따라서 아래에서

- **URL 구조, 제목 문구, 스니펫에 드러난 소구점**은 관찰된 사실입니다.
- **본문이 몇 단어인지, 어떤 H2를 쓰는지**는 이 문서의 근거가 아닙니다. 필요하면 브라우저에서 직접 확인해야 합니다.

검색은 US 로케일 기준이라 한국어 SERP는 실제 국내 결과와 순서가 다를 수 있습니다. 순위 자체보다 **어떤 유형의 사이트가 올라오는가**를 읽는 용도로 보세요.

## 수집한 SERP

### merge PDF (영문)

`smallpdf.com/merge-pdf` · `freepdfconvert.com/merge-pdf` · `adobe.com/acrobat/online/merge-pdf.html` · `ilovepdf.com/merge_pdf` · `tools.pdf24.org/en/merge-pdf` · `drawboard.com/tools/merge-pdfs` · `pipefile.com/tools/pdf-merger` · `foxit.com/merge-pdf/` · `jotform.com/pdf/merge/`

### PDF 합치기 (국문)

`smallpdf.com/kr/merge-pdf` · `tools.pdf24.org/ko/merge-pdf` · `adobe.com/kr/acrobat/online/merge-pdf.html` · `maxai.co/ko/pdf-tools/pdf-병합/` · `ilovepdf.com/ko/merge_pdf` · `allinpdf.com/kr/merge-pdf` · `jform.co.kr/pdf/merge/`

### word counter (영문)

`charactercountonline.com` · `wordcounter.net/character-count` · `quillbot.com/word-counter` · `easywordcount.com` · `grammarly.com/word-counter` · `wordcounttool.com` · `wordcount.com`

### 글자수 세기 (국문)

`studio-jt.co.kr/글자수세기/` · `jobkorea.co.kr/service/user/tool/textcount` · `lab.incruit.com/tools/text` · `url.kr/p/textcounter/` · `toolify.kr/tools/text-counter/` · `lettercounter.net`

### png to jpg / jpg to png

`adobe.com/express/feature/image/convert/png-to-jpg` · `freeconvert.com/png-to-jpg` · `freeconvert.com/jpg-to-png` · `iloveimg.com/convert-to-jpg/png-to-jpg` · `picflow.com/convert/jpg-to-png` · `canva.com/features/png-to-jpg-converter/` · `png2jpg.com` · `jpg2png.com`

### webp to jpg

`cloudconvert.com/webp-to-jpg` · `pixlr.com/converter/webp-to-jpg/` · `pixelied.com/convert/webp-converter/webp-to-jpg` · `ezgif.com/webp-to-jpg` · `freeconvert.com/webp-to-jpg` · `picflow.com/convert/webp-to-jpg` · `canva.com/features/webp-to-jpg-converter/` · `convertio.co/webp-jpg/` · `webptojpg.com`

### 사다리타기

`apps.ojj.kr/ladder/` · `url.kr/p/ghost-leg/` · `app.mgunexcel.com/random-ladder` · `youtil.kr/tools/life/ladder` · `ladder.ojj.kr` · `iwi.kr/app/ladder/` · `mintelly.com/p/ladder-game.html` · `helpietools.com/ladder`

## 관찰된 패턴

### 1. 변환 도구는 방향이 정해진 쌍마다 페이지가 하나씩 있다

이미지 변환 SERP에서 예외를 찾지 못했습니다. 같은 사이트가 방향별로 URL을 나눠 가집니다.

- `freeconvert.com/png-to-jpg` 와 `freeconvert.com/jpg-to-png`
- `canva.com/features/png-to-jpg-converter/` 와 `.../jpg-to-png-converter/`
- `picflow.com/convert/jpg-to-png` 와 `picflow.com/convert/webp-to-jpg`

`png2jpg.com`과 `jpg2png.com`은 아예 **도메인을 따로** 씁니다. 한 페이지로 여러 쌍을 덮는 사이트는 상위에 없었습니다.

Utilark는 `/{lang}/tools/image-converter/` 한 페이지가 JPG·PNG·WebP 사이의 순서쌍 6개를 전부 담당합니다. "image converter"라는 상위 개념어는 "png to jpg"류보다 검색량이 훨씬 적으므로, 현재 구조로는 이 계열 키워드에 거의 걸리지 않습니다.

쌍별로 나누면 6쌍 × 2언어 = **12개 색인 페이지**가 생깁니다. 컴포넌트는 하나를 재사용하고 `getStaticPaths`로 쌍을 넘기면 되므로 구현 비용이 크지 않고, AdSense의 얇은 콘텐츠 문제와 검색 유입을 동시에 개선하는 유일한 항목입니다.

### 2. 경쟁자는 거대 브랜드 아니면 단일 목적 사이트, 두 덩어리로 갈린다

- **도메인 권위형**: Adobe, Canva, Grammarly, Quillbot, 잡코리아, 인크루트
- **정확 일치 도메인 + 단일 목적형**: `png2jpg.com`, `jpg2png.com`, `webptojpg.com`, `wordcount.com`, `wordcounter.net`, `lettercounter.net`, `charactercountonline.com`

Utilark는 둘 다 아닙니다. 권위로 이길 수 없고 도메인도 일반명입니다. 남는 길은 **롱테일**입니다 — 구체적인 변환 쌍, 한국어 특유의 의도, 경쟁이 덜한 포맷(WebP), 그리고 아래 4번의 사다리타기.

### 3. 사다리타기 SERP는 경쟁 강도가 가장 낮다

상위에 Adobe급이 하나도 없고, **Blogspot 블로그**(`mintelly.com/p/ladder-game.html`)가 올라옵니다. 조사한 키워드 중 진입 장벽이 가장 낮습니다.

다만 상위 사이트와 두 가지가 다릅니다.

- **인원 상한**: OJJ는 2~30명을 내세우는데 Utilark는 8명입니다. 회식·팀 나누기 용도에서 8명은 부족합니다.
- **의도 단어**: 상위 스니펫에 반복되는 말은 **제비뽑기, 팀 나누기, 벌칙 정하기, 당첨자 추첨, 내기**입니다. Utilark 카피에는 "커피 내기, 발표 순서, 집안일" 정도만 있습니다.

### 4. 한국어 글자수 세기의 검색 의도는 자기소개서다

상위 두 곳이 취업 사이트입니다 — 잡코리아, 인크루트. 이들이 이기는 이유는 도메인 권위도 있지만 **의도가 자소서 글자수 제한**이기 때문입니다. 한글이 UTF-8에서 3바이트라 입사지원 양식이 바이트로 제한을 거는 경우가 많고, 그래서 **바이트 계산**이 이 키워드의 핵심 기능입니다.

Utilark는 UTF-8 바이트를 이미 계산합니다. 그런데 한국어 카피 어디에도 **자기소개서·자소서·이력서·입사지원서**가 없습니다. 기능은 갖췄는데 그 기능이 왜 필요한지를 쓰지 않은 상태입니다.

### 5. 제목 태그 공식이 다르다

관찰된 상위 제목:

| 제목 | 구성 |
|---|---|
| `PDF 합치기 - 무료로 인터넷에서 PDF 파일 병합하기` | 키워드 + 무료 + 동의어(병합) |
| `Merge PDF: Combine PDF Files with Free PDF Combiner` | 키워드 + 동의어 2개 + Free |
| `PNG to JPG – Convert PNG to JPG Online` | 키워드 반복 + Online |
| `Best WEBP to JPG Converter (Free, Fast & No Ads)` | 최상급 + 괄호 혜택 |
| `WordCount — Free Word Counter, Instant & Private` | 브랜드 + 혜택 나열 |
| `사다리타기 — 무료 온라인 사다리 게임 (캐릭터·실시간 미리보기) \| Youtil` | 키워드 + 무료 + 온라인 + 기능 + 브랜드 |

Utilark 현재 형식은 `BaseLayout.astro`의 `${title} · Utilark`입니다. 결과는 `PDF 합치기 · Utilark`, `Merge PDF · Utilark`. **무료·온라인·동의어·혜택어가 전부 빠져 있습니다.**

`ToolCopy`에 로케일별 `titleTag` 필드를 하나 추가하고 도구 페이지에서 이를 우선 사용하면 됩니다. 비용 대비 효과가 가장 좋습니다.

### 6. 한국어는 동의어와 띄어쓰기 변형을 함께 덮어야 한다

실제로 병행 사용되는 표기:

- PDF **합치기** / PDF **병합**
- **글자수** 세기 / **글자 수** 세기 (띄어쓰기 변형이 실제 상위 제목에 둘 다 등장)
- 사다리타기 / 사다리 게임 / 사다리게임

상위 사이트는 제목이나 본문에서 이 변형들을 함께 다룹니다. Utilark의 도구 이름은 한 가지 표기만 씁니다.

### 7. URL 깊이가 얕다

상위 URL은 대부분 1~2 세그먼트입니다: `/merge-pdf`, `/kr/merge-pdf`, `/ko/merge_pdf`, `/png-to-jpg`, `/webp-to-jpg`.

Utilark는 `/ko/tools/merge-pdf/`로 3개이고 `tools/` 세그먼트가 하는 일이 없습니다. 순위 요인으로서 URL 깊이의 비중은 크지 않지만, **색인이 거의 쌓이지 않은 지금이 바꾸기 가장 싼 시점**입니다. 나중에 바꾸면 리다이렉트를 유지해야 합니다.

로케일을 경로에 두는 것 자체는 표준과 일치합니다. Smallpdf와 Adobe는 `/kr/`, PDF24와 iLovePDF는 `/ko/`를 씁니다.

## 전략에 영향을 주는 두 가지 반증

### "브라우저에서 처리"는 차별점이 아니다

같은 주장을 하는 상위 사이트가 여럿입니다.

- `png2jpg.com` — "All processing happens in your browser – your files never leave your device"
- `picflow.com` — "processes the conversion in your browser"
- `maxai.co` — "브라우저에서 처리되며 클라우드에 업로드되지 않아"
- `drawboard.com` — "entirely within your browser"

사실이고 지킬 가치가 있는 성질이지만, **이것만으로 순위가 나오지는 않습니다.** 반대로 Smallpdf는 "서버에 올리되 한 시간 내 영구 삭제"로 포지셔닝하며 상위에 있습니다. 즉 이 축은 승부처가 아닙니다.

### 광고 없음을 경쟁력으로 내세우는 상위 사이트가 있다

`wordcount.com`은 "no ads, no signup"을, `picflow.com`은 제목에 "(Free, Fast & No Ads)"를 내겁니다. AdSense를 붙이려는 계획과 방향이 반대인 경쟁자가 상위에 있다는 뜻입니다.

광고를 포기할 이유는 아니지만, **광고가 도구 조작을 방해하지 않는 배치**가 경쟁상으로도 중요해집니다. 현재 `AdSlot`은 도구 UI 바로 아래(`margin-top: 2rem`)에 있어 결과 다운로드 버튼과 가깝습니다.

## 제안하는 실행 순서

1. **이미지 변환을 쌍별 페이지로 분리** — 검색 유입과 AdSense 콘텐츠 문제를 동시에 해결. 효과가 가장 크고 유일하게 구조적인 변경.
2. **제목 태그 공식 적용** — `ToolCopy.titleTag` 추가. 반나절.
3. **사다리타기 보강** — 인원 상한 30명, 의도 키워드(제비뽑기·팀 나누기·벌칙) 반영. 조사한 키워드 중 가장 이길 만한 지면에 대한 투자.
4. **글자수 세기 한국어 카피 재작성** — 자소서·바이트 제한 의도를 정면으로 다루기.
5. **URL에서 `tools/` 제거 여부 결정** — 하려면 지금.

## 후속으로 확인이 필요한 것

본문을 열지 못해 답하지 못한 질문들입니다. 브라우저에서 직접 보면 바로 확인됩니다.

- 상위 페이지의 도구 아래 본문이 실제로 몇 단어인지 (Utilark의 235단어가 어느 수준인지 판단하려면 필요)
- FAQ 섹션과 `FAQPage` 구조화 데이터를 쓰는지
- 변환 쌍 페이지끼리 서로 내부 링크를 거는지 (건다면 Utilark도 쌍 페이지 사이를 이어야 함)
- 국내 SERP 실제 순위 (이 조사는 US 로케일 기준)
