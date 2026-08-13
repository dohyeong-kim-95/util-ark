# Utilark 확인·결정 대기 목록

AdSense 준비 작업(`6e62b57`)에서 남은 항목입니다. 코드로 끝낼 수 없거나 결정이 필요한 것만 적습니다.

경쟁 키워드 조사는 `docs/seo-research.md`에, 서브도메인 정책은 `docs/subdomains.md`에 있습니다.

## 사람이 직접 해야 하는 것

- [ ] **AdSense 저장소 변수 등록** — Settings → Secrets and variables → Actions → **Variables** 탭에 `PUBLIC_ADSENSE_CLIENT` 추가. Secrets 탭이 아닙니다. 등록 후 재배포해야 심사용 스크립트와 `/ads.txt`가 살아납니다.
- [ ] **AdSense 콘솔에서 동의 메시지 게시** — 개인정보 보호 및 메시지에서 GDPR 메시지와 미국 주법 메시지를 게시. Google 인증 동의 메시지는 `adsbygoogle.js`를 통해 전달되므로 저장소에 추가할 스크립트는 없습니다. 이 단계를 건너뛰면 EEA·영국·스위스 게재가 규정 위반입니다.
- [ ] **승인 후 `PUBLIC_ADSENSE_SLOT` 등록** — 도구 페이지에 실제 광고 단위가 렌더됩니다.

## 검증하지 못한 것

- [ ] **라이브 루트 302 동작 확인** — 개발 세션의 네트워크 정책이 `utilark.app` 접근을 차단해(egress 403) 배포된 엣지 동작을 확인하지 못했습니다. 빌드 산출물과 Worker 단위 테스트는 통과했지만, `run_worker_first`와 assets 라우팅의 실제 상호작용은 런타임에서만 드러납니다.

  ```bash
  curl -sI -H 'Accept-Language: ko-KR,ko;q=0.9' https://utilark.app/ | head -3   # 302 → /ko/
  curl -sI -H 'Accept-Language: fr-FR' https://utilark.app/ | head -3            # 302 → /en/
  curl -sI -H 'Cookie: utilark_lang=ko' https://utilark.app/ | head -3           # 302 → /ko/
  curl -s https://utilark.app/ads.txt                                            # 변수 미설정 시 주석 한 줄
  ```

  루트가 여전히 언어 선택 HTML을 반환하면 `wrangler.jsonc`의 assets 라우팅을 다시 봐야 합니다.

- [ ] **라이브 서브도메인 리다이렉트 확인** — 같은 egress 차단으로 확인하지 못했습니다. DNS는 세션에서 조회해 확인했고(`mergepdf`·`png2jpg`·`pdf2image`가 모두 Cloudflare로 해석), 라우트는 배포 로그에 찍혔습니다(`*.utilark.app/* (zone name: utilark.app)`). 남은 건 실제 응답입니다.

  ```bash
  curl -sI -H 'Accept-Language: ko-KR,ko;q=0.9' https://mergepdf.utilark.app/ | head -5  # 302 → utilark.app/ko/tools/merge-pdf/
  curl -sI -H 'Accept-Language: en-US' https://png2jpg.utilark.app/ | head -5            # 302 → utilark.app/en/tools/image-converter/
  curl -sI https://mergepdf.utilark.app/ko/privacy/ | head -5                            # 301 → utilark.app/ko/privacy/
  curl -sI https://www.utilark.app/ | head -5                                            # 301 → utilark.app/
  ```

  `1001`·`1016` 오류가 나오면 와일드카드 DNS 레코드가 프록시(주황 구름)가 아닌 DNS only(회색)인지 확인해야 합니다. 회색이면 라우트가 걸리지 않습니다.

- [ ] **사다리타기 실기기 확인** — 빌드와 타입 검사만 통과한 상태입니다. 모바일에서 사다리 SVG의 세로줄이 위아래 이름칸 가운데와 정확히 맞는지, 화면을 회전했을 때 좌표가 다시 잡히는지 확인이 필요합니다.

## 보류 중인 기능

- [ ] **단어카드 (`claude/flashcards-tool` 브랜치)** — 구현은 끝났고 타입 검사와 빌드를 통과했지만 main에는 올리지 않았습니다. 앞면을 보여주고 제한 시간(기본 3초) 안에 뒷면을 타이핑하거나 말해서 맞히는 도구로, 맞힌 카드는 대기열에서 빼고 틀린 카드는 모아 섞어서 다음 회차에 다시 냅니다. 영문 페이지 본문 571단어로 기존 도구(235단어)보다 콘텐츠도 두껍습니다.

  올리기 전에 정해야 할 것:
  - **음성 인식의 개인정보 문제** — 이것이 가장 큰 쟁점입니다. `SpeechRecognition`은 브라우저 기능이고 Chrome·Safari 모두 녹음한 음성을 제조사 서버로 보내 글자로 바꿉니다. "파일이 기기를 떠나지 않는다"는 사이트의 핵심 주장과 정면으로 부딪히므로, 기본값 끄기 + 켤 때 경고 + 처리방침 문단 추가로 설계해 두었습니다(브랜치에 포함). 그래도 광고 심사를 앞두고 이 예외를 만들지, 아니면 음성을 빼고 타이핑 전용으로 낼지 결정이 필요합니다.
  - **3초가 실제로 쓸 만한지** — 짧은 영단어 기준으로 잡았고 5초·10초 선택지를 넣어 두었지만 실기기 확인이 필요합니다.
  - 그 외 실기기 확인: Firefox는 음성 인식 미지원이라 설정이 자동으로 비활성화됩니다.

## 결정이 필요한 것

- [ ] **광고 문구 시점** — 개인정보 처리방침의 광고 문단을 현재형("Utilark는 Google AdSense가 제공하는 광고를 게재합니다")으로 써 두었습니다. `PUBLIC_ADSENSE_CLIENT`를 설정해 배포하는 시점부터 사실이 됩니다. 당분간 변수를 설정하지 않을 계획이면 문구가 실제보다 앞서므로 되돌려야 합니다.
- [ ] **원격 브랜치 정리** — `claude/google-adsense-eligibility-b6ke9x`는 main에 모두 머지됐지만 원격에 남아 있습니다.
- [ ] **이미지 변환을 쌍별 페이지로 분리** — `docs/seo-research.md`의 가장 큰 발견이고, 이제 독립 사례가 넷입니다(`freeconvert`·`canva`·`foxyutils`·`foxit`). 반례를 아직 못 찾았습니다. 서브도메인 쪽은 `jpg2png`·`png2jpg`·`jpg2webp`·`webp2jpg`·`png2webp`·`webp2png` 이름을 이미 예약해 뒀으므로, 쌍별 페이지가 생기면 `worker/subdomains.js`에서 `pending`을 지우고 `tool` 슬러그만 바꾸면 연결됩니다. 상위 노출되는 변환 도구는 예외 없이 방향이 정해진 쌍마다 페이지가 하나씩 있고(`png2jpg.com`과 `jpg2png.com`은 도메인까지 따로), Utilark는 한 페이지가 6쌍을 전부 덮어 어느 키워드에도 걸리지 않습니다. 쌍별로 나누면 12개 색인 페이지가 생겨 검색 유입과 아래의 얇은 콘텐츠 문제를 함께 해결합니다.
- [ ] **광고 노출 시 실제 배치 확인** — `PUBLIC_ADSENSE_SLOT`을 넣기 전에는 슬롯이 렌더되지 않아 실기기 확인이 불가능합니다. 넣은 뒤 모바일에서 **결과 다운로드 버튼과 광고 사이 간격**을 눈으로 보세요. FoxyUtils는 도구보다 위에 광고를 두 개 깔아 도구가 한참 밀리는데(`docs/seo-research.md`의 추가 조사), Utilark는 도구 아래 `3.5rem`으로 떨어뜨려 뒀습니다. 오터치가 광고 클릭이 되면 AdSense 정책 위반 위험도 있습니다.

- [ ] **도구 페이지 본문 확충** — 승인의 실질적 관문입니다. 도구가 3개에서 4개로 늘고 사다리타기 페이지는 본문이 더 두껍지만(영문 377단어), 먼저 만든 세 도구는 여전히 235단어 수준입니다. 기존 세 도구의 본문을 새 두 도구 수준으로 맞추고 `/{lang}/guides/` 섹션을 신설하는 방향을 제안합니다.
- [ ] **남은 Bubblelab 마이그레이션 후보** — `calendar`, `photo`, `passport-pic`, `stars`가 브라우저 전용으로 남아 있습니다. `passport-pic`(증명사진)이 검색 수요와 콘텐츠 밀도 면에서 다음 후보로 가장 좋아 보입니다. `brief`·`fortune`·`planner`·`chat`은 서버가 필요해 제외했고, `proofread`는 한국어 전용이라 별도 판단이 필요합니다.

## 정리된 것

- **도구 페이지 상호 링크 (2026-08-13)** — 도구 페이지 하단에 다른 도구 그리드를 넣었습니다. 그 전에는 도구 페이지에서 다른 도구로 가는 링크가 하나도 없어 막다른 길이었습니다. Foxit이 모든 도구 페이지에 전체 도구 그리드를 까는 것을 보고 적용했고, 이는 `docs/seo-research.md`가 열어 뒀던 "쌍 페이지끼리 내부 링크를 거는지" 질문의 답이기도 합니다. `npm test`가 모든 도구 페이지의 상호 링크를 검사합니다.
- **제목 태그 공식 적용 (2026-08-13)** — `ToolCopy.titleTag`를 추가하고 도구 8개 지면(4도구 × 2언어)에 적용했습니다. `PDF 합치기 · Utilark` → `PDF 합치기 - 무료 온라인 PDF 병합 | Utilark`. 한국어 제목에는 동의어·띄어쓰기 변형(`글자수`/`글자 수`, `사다리타기`/`사다리 게임`)을 함께 넣었습니다. `npm test`가 브랜드 형식·`무료`/`Free` 포함·60자 상한을 검사하며, 길이는 `&amp;`를 디코딩한 뒤 잽니다.
- **서브도메인 배포 (2026-08-13)** — `*.utilark.app/*` 와일드카드 라우트가 배포됐습니다. 준비 두 가지(와일드카드 CNAME 프록시 레코드, 배포 토큰의 `Zone → Workers Routes → Edit`)는 끝났고 최초 1회로 종료입니다. 앞으로 도구를 추가할 때 대시보드 작업이 없습니다. 미지수였던 `admin.utilark.app` Custom Domain과의 겹침은 **문제 없었습니다** — Cloudflare가 와일드카드 라우트를 받아들였고, Custom Domain이 자기 호스트에서 우선합니다. 정책과 매핑은 `docs/subdomains.md`에 있습니다.
- **도메인 메일 스푸핑 방지 (2026-08-13)** — `@utilark.app`으로 메일을 보내지도 받지도 않으므로 SPF(`v=spf1 -all`), DMARC(`p=reject`), 빈 DKIM TXT 레코드를 넣어 도용을 차단했습니다. MX는 받을 메일이 없어 넣지 않았습니다. 나중에 이 도메인으로 메일을 보낼 일이 생기면 SPF의 `-all`을 먼저 고쳐야 하며, 안 고치면 발송분이 전부 거부됩니다.
- **운영자 표기** — 운영자가 사업자가 아님을 확인했습니다. 개인정보 처리방침과 소개 페이지는 "회사가 아니라 한 명의 독립 개발자가 운영"으로 표기하며, 사업자등록번호·통신판매업 신고번호를 추가하라는 이전 권고는 철회합니다. 광고 수익이 발생하더라도 개인 운영 사이트로서 현재 표기가 맞습니다.
- **로또 번호 생성기** — 마이그레이션 후보에서 제외했습니다. AdSense는 도박 및 관련 콘텐츠를 제한하므로, 승인 심사를 앞둔 시점에 굳이 위험을 만들 이유가 없습니다.
