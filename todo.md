# Utilark 확인·결정 대기 목록

AdSense 준비 작업(`6e62b57`)에서 남은 항목입니다. 코드로 끝낼 수 없거나 결정이 필요한 것만 적습니다.

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

- [ ] **단어카드·사다리타기 실기기 확인** — 두 도구 모두 자동 테스트가 아니라 빌드와 타입 검사만 통과한 상태입니다. 특히 확인이 필요한 것: 3초 제한이 실제로 쓸 만한지, 모바일에서 사다리 SVG가 이름칸과 정확히 맞는지, 음성 인식이 Chrome·Safari에서 켜지는지(Firefox는 미지원이라 자동으로 비활성화됩니다).

## 결정이 필요한 것

- [ ] **광고 문구 시점** — 개인정보 처리방침의 광고 문단을 현재형("Utilark는 Google AdSense가 제공하는 광고를 게재합니다")으로 써 두었습니다. `PUBLIC_ADSENSE_CLIENT`를 설정해 배포하는 시점부터 사실이 됩니다. 당분간 변수를 설정하지 않을 계획이면 문구가 실제보다 앞서므로 되돌려야 합니다.
- [ ] **원격 브랜치 정리** — `claude/google-adsense-eligibility-b6ke9x`는 main에 모두 머지됐지만 원격에 남아 있습니다.
- [ ] **도구 페이지 본문 확충** — 승인의 실질적 관문입니다. 도구가 3개에서 5개로 늘고 새 두 페이지는 본문이 훨씬 두껍지만(영문 단어카드 571단어, 사다리타기 377단어), 먼저 만든 세 도구는 여전히 235단어 수준입니다. 기존 세 도구의 본문을 새 두 도구 수준으로 맞추고 `/{lang}/guides/` 섹션을 신설하는 방향을 제안합니다.
- [ ] **남은 Bubblelab 마이그레이션 후보** — `calendar`, `photo`, `passport-pic`, `stars`가 브라우저 전용으로 남아 있습니다. `passport-pic`(증명사진)이 검색 수요와 콘텐츠 밀도 면에서 다음 후보로 가장 좋아 보입니다. `brief`·`fortune`·`planner`·`chat`은 서버가 필요해 제외했고, `proofread`는 한국어 전용이라 별도 판단이 필요합니다.

## 정리된 것

- **운영자 표기** — 운영자가 사업자가 아님을 확인했습니다. 개인정보 처리방침과 소개 페이지는 "회사가 아니라 한 명의 독립 개발자가 운영"으로 표기하며, 사업자등록번호·통신판매업 신고번호를 추가하라는 이전 권고는 철회합니다. 광고 수익이 발생하더라도 개인 운영 사이트로서 현재 표기가 맞습니다.
- **로또 번호 생성기** — 마이그레이션 후보에서 제외했습니다. AdSense는 도박 및 관련 콘텐츠를 제한하므로, 승인 심사를 앞둔 시점에 굳이 위험을 만들 이유가 없습니다.
