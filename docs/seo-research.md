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

---

# 추가 조사: FoxyUtils (2026-08-13)

`foxyutils.com/mergepdf/`를 따로 봤습니다. 근거 수준이 위 조사와 다릅니다.

- **URL과 제목**: 검색 결과에서 관찰. 위 조사와 같은 수준.
- **본문·광고 배치**: 조사 환경에서 `foxyutils.com`이 egress 차단(`EGRESS_BLOCKED`)이라 열지 못했고, **운영자가 모바일 브라우저에서 찍은 스크린샷**으로 확인했습니다. 이 부분은 위 조사보다 근거가 강합니다.
- **본문 분량, H2 구조, 구조화 데이터, 내부 링크**: 여전히 확인하지 못했습니다.

## 베낄 것

### 1. URL이 한 세그먼트다

`/mergepdf/` · `/splitpdf/` · `/rotatepdf/` · `/unlockpdf/` · `/wordtopdf/` · `/pdftojpg/` · `/jpgtopdf/` · `/epubtopdf/`

위 조사의 7번(URL 깊이)을 다시 확인해 줍니다. `tools/` 같은 중간 세그먼트가 없고, 로케일도 경로에 없습니다.

### 2. 방향 쌍이 각각 별도 페이지다

`pdftojpg`와 `jpgtopdf`가 **서로 다른 페이지**입니다. 1번 발견의 세 번째 독립 사례입니다(앞의 둘은 `freeconvert`, `canva`). 이 패턴에서 예외를 아직 못 찾았습니다.

이름 규칙은 `{from}to{to}`이고, `png2jpg.com` 계열은 `{from}2{to}`입니다. 둘 다 실제로 쓰입니다. Utilark 서브도메인은 `2` 쪽을 씁니다(`docs/subdomains.md`).

### 3. 제목 공식이 위 조사의 5번과 정확히 같다

| 관찰된 제목 |
|---|
| `Merge PDF - Combine PDF Files for Free \| FoxyUtils` |
| `Split PDF Files Online for Free \| FoxyUtils` |
| `Unlock PDF Files for Free \| FoxyUtils` |
| `PDF to JPG Converter \| FoxyUtils` |
| `Word to PDF Converter \| FoxyUtils` |

`키워드 + 동의어 + Free/Online | 브랜드`. **적용했습니다** — `ToolCopy.titleTag`가 생겼고 `PDF 합치기 · Utilark`는 `PDF 합치기 - 무료 온라인 PDF 병합 | Utilark`가 됐습니다. 한국어 제목에는 6번(동의어·띄어쓰기 변형)을 함께 넣었습니다. `npm test`가 형식과 60자 상한을 검사합니다.

### 4. 한 키워드를 지면 세 개로 덮는다

"merge pdf" 하나에 대해:

| 지면 | 예시 |
|---|---|
| 도구 페이지 | `foxyutils.com/mergepdf/` |
| 헬프 문서 | `help.foxyutils.com/article/23-how-to-merge-pdf-files` |
| 블로그 글 | `foxyutils.com/blog/2019/04/02/why-is-knowing-how-to-combine-pdfs-essential/` |

도구 페이지는 얇아도 되고 깊이는 다른 지면이 담당하는 구조입니다. `todo.md`의 "도구 페이지 본문 확충 / `/{lang}/guides/` 신설"과 같은 방향이고, 이쪽이 더 나은 근거입니다. 헬프를 **서브도메인**에 둔 것도 눈여겨볼 만하지만, Utilark는 서브도메인을 진입점으로만 쓰기로 했으므로 `/{lang}/guides/` 경로가 맞습니다.

### 5. 신뢰 신호를 사람으로 만든다

"2008년부터", "네트워크 보안 전문가 두 명이 창업", "5,000회 변환마다 나무 한 그루". 도구 사이트에서 E-E-A-T를 만드는 방식입니다. Utilark 소개 페이지의 "회사가 아니라 한 명의 독립 개발자가 운영"도 같은 축인데, 지금은 면책 문구처럼 읽힙니다.

## 베끼지 말 것

### 1. 광고 배치 — 정확히 반대로 가야 한다

스크린샷에서 확인된 모바일 순서입니다.

```
H1 "Merge PDF"
부제 "Combine PDF files by uploading them below"
[광고]                        ← 도구보다 위
"Tired of ads? Get Premium to go unlimited and ad free."
[업로드 박스]                  ← 여기서야 도구가 나온다
[앱 설치 광고 — PDF Reader]
[광고]
```

**도구를 쓰러 온 사람이 도구를 보기 전에 광고를 두 번 지나갑니다.** 그리고 그 짜증 자체를 유료 전환 문구로 씁니다. 이건 도메인 권위(2008년~)와 유료 플랜이 있으니까 감당되는 배치이고, Utilark는 둘 다 없습니다.

Utilark는 `AdSlot`이 `ToolPage.astro`에서 `interactive-panel` **뒤**에 있어 구조는 이미 반대입니다. 다만 간격이 `2rem`이라 결과 다운로드 버튼과 가까웠습니다 — `3.5rem`으로 벌리고 이유를 CSS에 적어 뒀습니다. 모바일에서 오터치가 남의 광고 클릭이 되는 자리이기 때문입니다.

위 조사의 반증 항목("광고 없음을 경쟁력으로 내세우는 상위 사이트가 있다")과 합치면 결론은 하나입니다. **광고는 도구 아래, 충분히 떨어져서.** AdSense 심사를 앞둔 시점이라 더 그렇습니다.

### 2. 업로드 모델

FoxyUtils는 서버로 올리고 "1시간 내 삭제"로 신뢰를 삽니다. Smallpdf와 같은 포지션입니다. `AGENTS.md`의 브라우저 전용 원칙과 정면으로 충돌하므로 도입 대상이 아닙니다. 위 조사가 이미 짚었듯 이 축은 순위 승부처가 아니라서, 포기할 이유도 없습니다.

### 3. 가입 벽과 `/operation_info/` 페이지

Sign in / Sign up, Pricing이 전역 내비게이션에 있습니다. Utilark는 계정이 없습니다.

그리고 `foxyutils.com/operation_info/mergepdf/<uuid>/` 형태의 **작업 결과 페이지가 검색에 노출됩니다.** 사용자마다 생기는 얇은 중복 페이지가 색인된 것이라, 베낄 패턴이 아니라 피할 실수에 가깝습니다. 브라우저 전용인 Utilark에는 애초에 이런 URL이 생기지 않습니다.

## 이 조사로 바뀐 우선순위

`todo.md`의 미결정 항목 중 두 개가 근거를 얻었습니다.

1. **이미지 변환 쌍별 페이지 분리** — 세 번째 독립 사례. 여전히 가장 큰 항목.
2. **`/{lang}/guides/` 신설** — FoxyUtils는 헬프와 블로그 두 층을 더 씁니다. 도구 페이지 본문을 무리하게 늘리는 것보다 지면을 나누는 쪽이 관찰된 패턴에 맞습니다.

---

# 추가 조사: Foxit (2026-08-13)

`foxit.com/merge-pdf/`의 도구 그리드를 운영자 스크린샷으로 확인했습니다.

## 미해결 질문 하나가 답을 얻었다

위 조사 끝의 "변환 쌍 페이지끼리 서로 내부 링크를 거는지" — **겁니다.** Foxit은 모든 도구 페이지 하단에 전체 도구 그리드를 깝니다. 관찰된 카드:

```
Word to PDF · PDF to JPG · PDF to Excel · Excel to PDF · PNG to PDF · PPT to PDF
PDF to PNG · PDF to PPT · HTML to PDF · Text to PDF · TIFF to PDF · PDF to Text
OCR PDF · RTF to PDF · PDF to TIFF · PDF to HTML · BMP to PDF · GIF to PDF
PDF to BMP · Merge PDF · Compress PDF · Split PDF · Delete Pages from PDF
Crop PDF · Rotate PDF · Extract PDF Pages · Add Pages to PDF · Rearrange PDF
Add Page Numbers to PDF · Unlock PDF
```

**적용했습니다** — 도구 페이지 하단에 다른 도구 그리드가 생겼습니다. 이전에는 도구 페이지에서 다른 도구로 가는 링크가 **하나도** 없어서, 나가는 길이 breadcrumb과 푸터뿐인 막다른 길이었습니다. `npm test`가 모든 도구 페이지가 나머지 도구 전부를 링크하는지 검사합니다.

## 쌍 분리의 네 번째 사례

`PDF to PNG`와 `PNG to PDF`, `PDF to Excel`과 `Excel to PDF`, `PDF to TIFF`와 `TIFF to PDF`가 전부 **양방향 각각** 카드를 가집니다. 앞의 세 사례(`freeconvert`, `canva`, `foxyutils`)에 이어 네 번째이고, 여전히 반례를 못 찾았습니다.

`todo.md`의 "이미지 변환을 쌍별 페이지로 분리"는 이제 근거가 넷입니다.

## 규모 감각

Foxit은 PDF 하나로 30개 안팎의 도구 지면을 가집니다. 방향 쌍을 나누면 지면이 이렇게 늘어난다는 뜻이고, Utilark는 전체가 4개입니다. 이미지 변환만 쌍으로 나눠도 6쌍 × 2언어 = 12지면이 되어 지금의 3배가 됩니다.

다만 Foxit은 유료 제품(Buy Now·장바구니·계정)의 유입 창구로 이 지면들을 운영합니다. 도구 자체가 목적인 Utilark와 사업 구조가 다르므로, 베낄 것은 **지면 분할과 상호 링크**이지 도구 개수 경쟁이 아닙니다.
