# crucru

라이브 커머스 PoC. 모노레포 — **데스크톱 웹(셀러/관리자)** 과 **모바일 앱(시청자)** 을 분리하고, **소셜 로그인 인증 백엔드**(Kakao / Google / Apple / Naver)는 웹 쪽 Next.js API로 공유합니다.

```
crucru/
├── web/      Next.js (App Router) — 데스크톱 셀러/관리자 웹 + 공유 auth API
│   ├── src/app/                  메인(/), 로그인(/login), 콜백(/auth/callback)
│   ├── src/app/api/auth/         /api/auth/[provider], callback, refresh, logout, me
│   ├── src/providers/            google · kakao · naver · apple (통일 인터페이스)
│   ├── src/services/             유저 upsert, JWT 발급/회전/폐기
│   ├── src/lib/                  supabase(service-role), jwt
│   └── supabase/migrations/      users · social_accounts · refresh_tokens
├── mobile/   Expo (React Native) — 시청자 앱
│   ├── App.tsx                   네비게이션 (Main → Login)
│   └── src/screens/              MainScreen(메인 홈), LoginScreen(소셜 로그인)
└── design/   Figma 추출 레퍼런스 이미지
```

## 플랫폼 매핑
- **모바일 앱(Expo RN)** = 시청자용. 앱을 켜면 **메인 홈**이 바로 뜨고, **로그인은 우측 상단**.
- **데스크톱 웹(Next.js)** = 셀러/관리자용. 메인 랜딩 → 우측 상단 로그인 → 셀러 로그인 시 관리자 화면(추후).
- **auth 백엔드** = `web/`의 Next.js route handler. 양쪽이 동일한 `/api/auth/*`를 사용.

## 인증 흐름
1. 로그인 시작: `GET /api/auth/{provider}` → provider 동의 화면 (서명 state로 CSRF 방어)
2. 콜백: `/api/auth/{provider}/callback` (Apple은 form_post POST) → code 교환 → 프로필 정규화 → Supabase upsert → 자체 JWT(access/refresh) 발급
3. 프론트로 토큰 전달 → `/api/auth/me`로 유저 확인, `/api/auth/refresh`로 회전

## 실행
### web (데스크톱 + auth API)
```bash
cd web
npm install
# .env 채우기 (.env.example 참고): SUPABASE_*, JWT_*, KAKAO_* 등
npm run dev          # http://localhost:3000
```
Supabase 스키마: `web/supabase/migrations/0001_auth_schema.sql` 적용 (이미 적용됨).

### mobile (시청자 앱)
```bash
cd mobile
npm install
npm start            # Expo — iOS/Android 시뮬레이터 또는 Expo Go
```
- API 주소는 `mobile/src/config.ts`에서 설정 (Android 에뮬레이터는 `10.0.2.2`).
- 모바일 OAuth는 앱 스킴(`crucru://auth/callback`)으로 복귀하도록 백엔드 리다이렉트 분기가 추가로 필요 (현재 웹 리다이렉트 기준).

## provider별 설정
각 콘솔에 Redirect URI 등록 (로컬 기준):
`http://localhost:3000/api/auth/{kakao|google|naver|apple}/callback`
Kakao 상세는 [SETUP-KAKAO.md](SETUP-KAKAO.md) 참고. 현재 `.env`에 채워진 provider만 활성화됩니다.
