# 서브도메인 정비

작성일: 2026-08-13 · 근거: `docs/seo-research.md` · 구현: `worker/subdomains.js`

## 결론부터

서브도메인은 **색인의 주소가 아니라 진입점**입니다. `mergepdf.utilark.app`은 자기 콘텐츠를 서빙하지 않고 `utilark.app/{언어}/merge-pdf/`로 보냅니다. 색인, 링크 신호, 사이트맵, AdSense 사이트 등록은 전부 `utilark.app` 한 곳에 남습니다.

### 왜 서브도메인이 자체 콘텐츠를 갖지 않는가

`docs/seo-research.md`에서 관찰한 대로, 변환 도구 SERP 상위에는 `png2jpg.com` · `jpg2png.com` 처럼 **도메인을 아예 분리한** 단일 목적 사이트가 있습니다. 다만 그들이 얻는 이점은 **도메인 완전일치(EMD)**에서 나오는 것이고, 서브도메인 라벨의 키워드는 그 자리를 대신하지 못합니다. `pdf2image.utilark.app`은 `pdf2image.com`이 아닙니다.

반대로 비용은 확실합니다. 구글은 서브도메인을 별개 사이트로 취급할 수 있어서, 아직 색인이 거의 없는 지금 11개 호스트로 쪼개면 각각 권위 0에서 다시 시작합니다. Search Console 속성, AdSense 사이트 등록, `canonical`·`hreflang`·사이트맵도 호스트 수만큼 늘어납니다.

같은 SERP에서 `freeconvert.com/png-to-jpg`, `canva.com/features/png-to-jpg-converter/`, `picflow.com/convert/jpg-to-png` 처럼 **한 도메인의 경로로** 쌍을 나눈 사이트들이 나란히 상위에 있습니다. 검색 유입을 위한 실제 작업은 경로를 쌍별로 쪼개는 쪽이고(2026-08-13 완료), 서브도메인은 **외우기 쉽고 공유하기 좋은 짧은 주소**라는 별개의 값을 합니다.

## 이름 규칙

두 가지뿐입니다.

- 변환 도구는 `{from}2{to}` — `png2jpg`, `pdf2image`
- 그 외 도구는 라벨 하나 — `ladder`, `wordcount`

도구 하나에 라벨 하나입니다. 별칭을 만들지 않습니다.

## 매핑 표

정본은 `worker/subdomains.js`의 `TOOL_SUBDOMAINS`이고, 아래는 그 표를 읽은 것입니다.

### 지금 도구가 있는 주소

| 서브도메인 | 도착지 |
|---|---|
| `imageconvert.utilark.app` | `/{언어}/image-converter/` |
| `mergepdf.utilark.app` | `/{언어}/merge-pdf/` |
| `wordcount.utilark.app` | `/{언어}/word-counter/` |
| `ladder.utilark.app` | `/{언어}/ladder/` |

### 예약된 주소

전용 페이지가 아직 없는 이름입니다. 지금은 언어별 홈으로 보내고, 페이지가 생기면 `TOOL_SUBDOMAINS`에서 `pending`을 지우고 `tool`만 바꾸면 됩니다.

| 서브도메인 | 현재 도착지 | 비고 |
|---|---|---|
| `pdf2image` | `/{언어}/` | 해당 도구 자체가 없음 |

2026-08-13에 변환 쌍 여섯 개가 예약에서 실제 페이지로 바뀌었습니다. `pending`을 지우고 `tool` 슬러그만 바꾸면 된다고 적어 뒀던 그대로였습니다.

| 서브도메인 | 도착지 |
|---|---|
| `png2jpg.utilark.app` | `/{언어}/png-to-jpg/` |
| `jpg2png.utilark.app` | `/{언어}/jpg-to-png/` |
| `jpg2webp.utilark.app` | `/{언어}/jpg-to-webp/` |
| `webp2jpg.utilark.app` | `/{언어}/webp-to-jpg/` |
| `png2webp.utilark.app` | `/{언어}/png-to-webp/` |
| `webp2png.utilark.app` | `/{언어}/webp-to-png/` |

서브도메인은 `{from}2{to}`, 경로는 `{from}-to-{to}`로 철자가 다릅니다. 둘 다 상위 경쟁자가 실제로 쓰는 표기입니다 — `png2jpg.com`과 `freeconvert.com/png-to-jpg`.

## 동작 규칙

| 요청 | 응답 |
|---|---|
| 도구 서브도메인의 `/` | **302** → 언어 협상한 도구 페이지 |
| 도구 서브도메인의 그 외 경로 | **301** → `utilark.app`의 같은 경로 |
| 표에 없는 서브도메인 | **301** → `utilark.app`의 같은 경로 |
| `admin.utilark.app` | 기존 관리자 처리 (변경 없음) |
| `utilark.app` | 기존 처리 (변경 없음) |

### 302를 쓰는 이유

도구 진입점만 302이고 나머지는 301입니다. 도착지가 요청마다 달라지기 때문입니다 — 언어는 `utilark_lang` 쿠키, 없으면 `Accept-Language`로 정해집니다. 301은 브라우저가 무기한 캐시하므로, 한 번 영문으로 들어온 방문자는 이후 한국어로 바꿔도 계속 영문 페이지로 끌려갑니다. `utilark.app/`의 루트 리다이렉트가 이미 같은 이유로 302에 `Vary: Accept-Language, Cookie`와 `Cache-Control: no-store`를 붙이고 있고, 서브도메인도 같은 규칙을 따릅니다.

도착지가 요청과 무관한 나머지 두 줄은 301입니다.

### 서브도메인은 루트만 소유한다

`mergepdf.utilark.app/ko/privacy/`는 도구가 아니라 사이트의 다른 페이지를 서브도메인에서 부른 것입니다. 이것을 그대로 서빙하면 서브도메인마다 사이트 전체 사본이 생겨 중복 콘텐츠가 됩니다. 그래서 루트가 아닌 모든 경로는 `utilark.app`의 같은 경로로 301 보냅니다.

### 언어 쿠키 범위

`utilark_lang`은 이전에 호스트 한정 쿠키라 `utilark.app`에서만 읽혔습니다. 그대로 두면 언어를 영문으로 직접 바꾼 방문자가 서브도메인으로 들어올 때 쿠키가 전달되지 않아 `Accept-Language`로 되돌아갑니다. 그래서 `Domain=utilark.app`로 넓혔고(`utilark_notrack`이 이미 쓰던 방식), 쓰기 직전에 예전 호스트 한정 쿠키를 만료시켜 두 값이 동시에 전송되지 않게 합니다. 개인정보 처리방침의 쿠키 문단도 이 범위로 고쳤습니다.

## Cloudflare 설정

서브도메인마다 Custom Domain을 등록하지 않습니다. `wrangler.jsonc`에 **와일드카드 라우트 한 줄**을 두면 배포가 알아서 반영합니다. Bubblelab이 `*.bubblelab.dev/*` 로 쓰는 방식과 같습니다.

```jsonc
"routes": [
  { "pattern": "*.utilark.app/*", "zone_name": "utilark.app" }
]
```

덕분에 도구를 추가할 때 대시보드 작업이 없습니다. `worker/subdomains.js`에 라벨 한 줄을 넣고 배포하면 그 주소가 바로 열립니다.

이 패턴은 apex(`utilark.app`)를 포함하지 않으므로 apex와 `admin.utilark.app`은 기존 Custom Domain 그대로 둡니다. 특정 호스트의 Custom Domain은 와일드카드 라우트보다 우선하고, 둘 다 같은 Worker를 가리키므로 동작이 달라지지 않습니다.

와일드카드가 걸리면 표에 없는 이름도 Worker에 도달하므로, **미등록 서브도메인을 apex로 301 보내는 규칙이 실제로 동작합니다.** 아무 이름이나 사이트 사본을 서빙하지 못하게 막는 것이 그 규칙입니다.

### 갖춰 둔 것 (2026-08-13, 최초 1회로 끝남)

와일드카드 라우트는 아래 둘이 있어야 실제로 요청을 받습니다. 둘 다 설정을 마쳤고, 이후 서브도메인을 늘려도 다시 할 일이 없습니다.

1. **와일드카드 DNS 레코드** — 이름 `*`, `utilark.app`을 가리키는 CNAME, 프록시 켬(주황 구름). Workers 라우트는 호스트가 Cloudflare를 통해 조회돼야 걸립니다. A 레코드로 해도 동일하게 동작합니다 — 프록시가 켜지면 요청이 엣지에서 끝나 레코드가 가리키는 주소는 쓰이지 않습니다. Universal SSL이 `utilark.app`과 `*.utilark.app`(한 단계)을 함께 덮으므로 인증서 작업은 없습니다.

2. **배포 토큰의 zone 권한** — `CLOUDFLARE_API_TOKEN`에 `Zone → Workers Routes → Edit`. 라우트를 코드로 배포하는 대가입니다. 권한이 없으면 `wrangler deploy`가 스크립트 업로드까지는 성공하고 라우트 단계에서만 `Authentication error [code: 10000]`으로 실패합니다. `Zone → Zone → Read`는 필요 없었습니다 — zone 조회는 기존 권한으로 됩니다.

2번은 이전 방침("배포 토큰에 zone 권한을 주지 않는다")을 바꾼 것입니다. 대시보드에서 도메인을 관리하면 토큰을 좁게 유지할 수 있지만, 도구가 늘 때마다 수작업이 붙습니다. 서브도메인을 계속 늘릴 계획이라 자동화 쪽을 택했습니다.

### admin Custom Domain과의 겹침 — 문제 없었음

`*.utilark.app/*`는 이미 Custom Domain인 `admin.utilark.app`을 포함합니다. Cloudflare가 이 겹침을 거부하는지는 실제 배포로만 확인할 수 있었는데, **거부하지 않았습니다.**

```
Deployed utilark triggers (1.21 sec)
  *.utilark.app/* (zone name: utilark.app)
```

Custom Domain이 자기 호스트에서 우선하고 둘 다 같은 Worker를 가리키므로 동작도 같습니다. admin Custom Domain은 그대로 두면 됩니다.

### 확인

```bash
curl -sI -H 'Accept-Language: ko-KR,ko;q=0.9' https://mergepdf.utilark.app/ | head -5
# 302 · Location: https://utilark.app/ko/merge-pdf/

curl -sI -H 'Accept-Language: en-US' https://png2jpg.utilark.app/ | head -5
# 302 · Location: https://utilark.app/en/png-to-jpg/

curl -sI https://mergepdf.utilark.app/ko/privacy/ | head -5
# 301 · Location: https://utilark.app/ko/privacy/
```

로컬에서는 `wrangler dev` 에 Host 헤더를 직접 주면 같은 경로를 밟습니다.

```bash
curl -sI -H 'Host: mergepdf.utilark.app' http://127.0.0.1:8787/ | head -5
```

## 도구를 추가할 때

`npm test`가 `worker/subdomains.js`를 `src/data/tools.ts`·`src/data/conversions.ts`의 슬러그와 대조합니다. 페이지를 새로 만들고 서브도메인을 안 정하면 실패하고, 존재하지 않는 페이지를 가리켜도 실패합니다. 순서는 이렇습니다.

1. `src/data/tools.ts`(도구) 또는 `src/data/conversions.ts`(변환 쌍)에 추가한다
2. `worker/subdomains.js`에 라벨 한 줄을 추가한다
3. `npm test`

배포하면 끝입니다. 와일드카드 라우트가 이미 모든 이름을 받고 있어서 대시보드 작업이 없습니다.

## 도구 URL이 한 단계 얕아졌다 (2026-08-13)

`/{언어}/tools/{슬러그}/` → `/{언어}/{슬러그}/`. 이유가 둘입니다.

1. `docs/seo-research.md`의 7번 발견 — 상위 URL은 전부 1~2 세그먼트이고 `tools/`는 하는 일이 없습니다. 색인이 쌓이기 전이 바꾸기 가장 싼 시점이라 적혀 있었습니다.
2. 같은 이름의 `utilark.com`이 `/en/tools/typing-test` 형태를 씁니다. 구조까지 같으면 이틀 된 이쪽이 모방으로 읽힙니다.

옛 경로는 하루 동안 살아 있었으므로 `worker/index.js`가 **301**로 보냅니다(`legacyToolPath`). 도착지가 요청과 무관하므로 영구 리다이렉트가 맞습니다. `/fr/tools/...`처럼 지원하지 않는 로케일이나 세그먼트가 더 붙은 경로는 건드리지 않습니다.

서브도메인 도착지도 함께 얕아졌습니다 — `mergepdf.utilark.app` → `utilark.app/{언어}/merge-pdf/`.
