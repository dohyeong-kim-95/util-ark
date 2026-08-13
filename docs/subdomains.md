# 서브도메인 정비

작성일: 2026-08-13 · 근거: `docs/seo-research.md` · 구현: `worker/subdomains.js`

## 결론부터

서브도메인은 **색인의 주소가 아니라 진입점**입니다. `mergepdf.utilark.app`은 자기 콘텐츠를 서빙하지 않고 `utilark.app/{언어}/tools/merge-pdf/`로 보냅니다. 색인, 링크 신호, 사이트맵, AdSense 사이트 등록은 전부 `utilark.app` 한 곳에 남습니다.

### 왜 서브도메인이 자체 콘텐츠를 갖지 않는가

`docs/seo-research.md`에서 관찰한 대로, 변환 도구 SERP 상위에는 `png2jpg.com` · `jpg2png.com` 처럼 **도메인을 아예 분리한** 단일 목적 사이트가 있습니다. 다만 그들이 얻는 이점은 **도메인 완전일치(EMD)**에서 나오는 것이고, 서브도메인 라벨의 키워드는 그 자리를 대신하지 못합니다. `pdf2image.utilark.app`은 `pdf2image.com`이 아닙니다.

반대로 비용은 확실합니다. 구글은 서브도메인을 별개 사이트로 취급할 수 있어서, 아직 색인이 거의 없는 지금 11개 호스트로 쪼개면 각각 권위 0에서 다시 시작합니다. Search Console 속성, AdSense 사이트 등록, `canonical`·`hreflang`·사이트맵도 호스트 수만큼 늘어납니다.

같은 SERP에서 `freeconvert.com/png-to-jpg`, `canva.com/features/png-to-jpg-converter/`, `picflow.com/convert/jpg-to-png` 처럼 **한 도메인의 경로로** 쌍을 나눈 사이트들이 나란히 상위에 있습니다. 검색 유입을 위한 실제 작업은 경로를 쌍별로 쪼개는 쪽(`todo.md`의 미결정 항목)이고, 서브도메인은 **외우기 쉽고 공유하기 좋은 짧은 주소**라는 별개의 값을 합니다.

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
| `imageconvert.utilark.app` | `/{언어}/tools/image-converter/` |
| `mergepdf.utilark.app` | `/{언어}/tools/merge-pdf/` |
| `wordcount.utilark.app` | `/{언어}/tools/word-counter/` |
| `ladder.utilark.app` | `/{언어}/tools/ladder/` |

### 예약된 주소

전용 페이지가 아직 없는 이름입니다. 지금은 같은 일을 하는 도구로 보내고, 페이지가 생기면 `TOOL_SUBDOMAINS`에서 `pending`을 지우고 `tool`만 바꾸면 됩니다.

| 서브도메인 | 현재 도착지 | 비고 |
|---|---|---|
| `jpg2png` · `png2jpg` | `/{언어}/tools/image-converter/` | 쌍별 페이지 분리 대기 |
| `jpg2webp` · `webp2jpg` | `/{언어}/tools/image-converter/` | 쌍별 페이지 분리 대기 |
| `png2webp` · `webp2png` | `/{언어}/tools/image-converter/` | 쌍별 페이지 분리 대기 |
| `pdf2image` | `/{언어}/` | 해당 도구 자체가 없음 |

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

## Cloudflare 설정 (사람이 직접 해야 함)

코드는 배포되면 바로 동작하지만, **호스트가 Worker에 연결되어야** 요청이 들어옵니다. `README.md`의 기존 방침대로 대시보드에서 처리하며, 배포 토큰에 zone 권한을 주지 않습니다.

**Workers & Pages → utilark → Domains → Add → Custom Domain**에서 아래를 각각 추가합니다.

```
imageconvert.utilark.app
mergepdf.utilark.app
wordcount.utilark.app
ladder.utilark.app
jpg2png.utilark.app
png2jpg.utilark.app
jpg2webp.utilark.app
webp2jpg.utilark.app
png2webp.utilark.app
webp2png.utilark.app
pdf2image.utilark.app
```

Custom Domain은 DNS 레코드와 인증서를 함께 만들어 주므로 별도 DNS 작업은 없습니다. 와일드카드는 지원하지 않아 한 줄씩 추가해야 합니다.

표에 없는 서브도메인을 `utilark.app`으로 정규화하는 규칙은 **안전망**입니다. 와일드카드 DNS 레코드를 두지 않는 한 등록되지 않은 이름은 애초에 조회되지 않습니다. 나중에 `*.utilark.app` 와일드카드 레코드와 `*.utilark.app/*` 라우트를 쓰기로 하면 그때부터 이 규칙이 실제로 동작합니다.

### 등록 후 확인

```bash
curl -sI -H 'Accept-Language: ko-KR,ko;q=0.9' https://mergepdf.utilark.app/ | head -5
# 302 · Location: https://utilark.app/ko/tools/merge-pdf/

curl -sI -H 'Accept-Language: en-US' https://png2jpg.utilark.app/ | head -5
# 302 · Location: https://utilark.app/en/tools/image-converter/

curl -sI https://mergepdf.utilark.app/ko/privacy/ | head -5
# 301 · Location: https://utilark.app/ko/privacy/
```

로컬에서는 `wrangler dev` 에 Host 헤더를 직접 주면 같은 경로를 밟습니다.

```bash
curl -sI -H 'Host: mergepdf.utilark.app' http://127.0.0.1:8787/ | head -5
```

## 도구를 추가할 때

`npm test`가 `worker/subdomains.js`와 실제 빌드된 도구 페이지를 대조합니다. 도구를 새로 만들고 서브도메인을 안 정하면 빌드가 실패하고, 서브도메인이 없는 페이지를 가리켜도 실패합니다. 순서는 이렇습니다.

1. `src/data/tools.ts`에 도구를 추가한다
2. `worker/subdomains.js`에 라벨 한 줄을 추가한다
3. `npm test`
4. 배포 후 Cloudflare 대시보드에서 Custom Domain을 추가한다

4번은 코드가 대신할 수 없으므로 `todo.md`에 남습니다.
