# 카카오 소셜 로그인 설정 가이드 (Next.js + Vercel 통합)

프론트+백엔드를 **하나의 Next.js 앱**으로 Vercel에 배포하는 구조 기준입니다.
OAuth 로직은 Next.js **route handler**(`app/api/auth/...`)로 동작합니다.

---

## 0. 구조 요약

```
사용자 ──클릭──▶ /api/auth/kakao ──redirect──▶ 카카오 동의화면
                                                   │
사용자 ◀─redirect(/auth/callback?token)─ /api/auth/kakao/callback ◀─code─┘
```

| 역할 | 경로 |
|------|------|
| 로그인 시작 | `GET /api/auth/kakao` |
| 카카오 콜백 (= **Redirect URI**) | `GET /api/auth/kakao/callback` |
| 토큰 받는 프론트 페이지 | `GET /auth/callback` |

> `{ORIGIN}` = 앱이 떠 있는 주소. 로컬은 `http://localhost:3000`, 운영은 `https://<your-app>.vercel.app`.

---

## 1. 카카오 개발자 콘솔 설정

https://developers.kakao.com → 내 애플리케이션

### 1-1. 앱 생성
- 애플리케이션 추가 → 앱 이름 / 회사명 입력

### 1-2. 플랫폼 등록 (Web)
**앱 설정 → 플랫폼 → Web → 사이트 도메인** 에 아래 둘 다 등록:
```
http://localhost:3000
https://<your-app>.vercel.app
```

### 1-3. 카카오 로그인 활성화
**제품 설정 → 카카오 로그인 → 활성화 ON**

### 1-4. Redirect URI 등록 ⭐가장 중요
**카카오 로그인 → Redirect URI** 에 아래 둘 다 등록 (경로까지 정확히 일치해야 함):
```
http://localhost:3000/api/auth/kakao/callback
https://<your-app>.vercel.app/api/auth/kakao/callback
```

### 1-5. 동의항목 (scope)
**카카오 로그인 → 동의항목** 에서 설정:

| 항목 | scope 값 | 비고 |
|------|----------|------|
| 닉네임 | `profile_nickname` | 선택 동의 가능 |
| 프로필 사진 | `profile_image` | 선택 동의 가능 |
| 카카오계정(이메일) | `account_email` | ⚠️ **비즈앱 전환** 또는 검수 필요할 수 있음 |

> ⚠️ **이메일 주의**: 카카오는 이메일 수집에 보통 비즈니스 앱 전환 또는 권한 신청이 필요합니다.
> 테스트 단계에서는 본인/팀원 계정을 **팀원으로 등록**하면 검수 없이 이메일까지 받을 수 있습니다.
> (앱 → 팀원 관리). 이메일을 못 받는 경우 우리 코드는 `email: null`로 유저를 만들고,
> 나중에 이메일이 들어오면 같은 카카오 계정으로 자동 연결됩니다.

### 1-6. 키 발급
- **앱 설정 → 앱 키 → REST API 키** → 이게 `KAKAO_CLIENT_ID`
- (선택, 권장) **카카오 로그인 → 보안 → Client Secret → 코드 발급 + 사용함** → `KAKAO_CLIENT_SECRET`

---

## 2. 환경변수

### 2-1. 로컬: `.env.local` (Next.js는 `.env.local`을 사용)
```bash
# 앱 자신의 주소 (로컬)
APP_BASE_URL=http://localhost:3000
FRONTEND_REDIRECT_URL=http://localhost:3000/auth/callback

# Supabase
SUPABASE_URL=https://szogfxzyhskftijdxxrz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role JWT — 이미 .env에 저장됨>

# JWT (이미 생성/저장됨)
JWT_ACCESS_SECRET=<생성된 값>
JWT_REFRESH_SECRET=<생성된 값>
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=1209600

# Kakao
KAKAO_CLIENT_ID=<REST API 키>
KAKAO_CLIENT_SECRET=<Client Secret, 안 쓰면 비움>
```

### 2-2. Vercel: Project Settings → Environment Variables
로컬과 동일하되 URL만 운영 도메인으로:
```
APP_BASE_URL=https://<your-app>.vercel.app
FRONTEND_REDIRECT_URL=https://<your-app>.vercel.app/auth/callback
SUPABASE_URL=...                (동일)
SUPABASE_SERVICE_ROLE_KEY=...   (동일, Production/Preview 모두 체크)
JWT_ACCESS_SECRET=...           (동일)
JWT_REFRESH_SECRET=...          (동일)
KAKAO_CLIENT_ID=...             (동일)
KAKAO_CLIENT_SECRET=...         (동일)
```
> `SUPABASE_SERVICE_ROLE_KEY`, `JWT_*` 는 **서버 전용 비밀**입니다. `NEXT_PUBLIC_` 접두사를 절대 붙이지 마세요(붙이면 브라우저로 노출됨).

---

## 3. Redirect URI 한눈에 보기

| 환경 | 카카오 콘솔에 등록할 Redirect URI | 콘솔 사이트 도메인 |
|------|-----------------------------------|--------------------|
| 로컬 | `http://localhost:3000/api/auth/kakao/callback` | `http://localhost:3000` |
| Vercel 운영 | `https://<your-app>.vercel.app/api/auth/kakao/callback` | `https://<your-app>.vercel.app` |

> ⚠️ **Vercel Preview 배포 주의**: PR마다 `https://<app>-<hash>.vercel.app` 식 임의 URL이 생기는데,
> 이건 카카오에 등록되지 않아 로그인이 실패합니다. **운영용 고정 도메인(또는 커스텀 도메인)** 으로만 테스트하세요.

---

## 4. Supabase 준비
`supabase/migrations/0001_auth_schema.sql` 을 Supabase SQL Editor에 붙여넣어 실행
(`users`, `social_accounts`, `refresh_tokens` 테이블 생성).

---

## 5. 테스트 절차
1. 카카오 콘솔에 위 Redirect URI / 사이트 도메인 / 동의항목 등록, REST API 키 복사
2. `.env.local` 에 `KAKAO_CLIENT_ID` 입력
3. Supabase 마이그레이션 실행
4. `npm run dev` 후 브라우저에서 `http://localhost:3000/api/auth/kakao` 접속
5. 카카오 로그인 → 동의 → `/auth/callback?access_token=...&refresh_token=...` 로 돌아오면 성공
6. `Authorization: Bearer <access_token>` 로 `/api/auth/me` 호출해 유저 확인

---

## 6. 아직 남은 작업 (코드)
현재 코드는 **Express(`src/index.ts`) 기준**입니다. Vercel 통합을 위해 다음 포팅이 필요합니다:
- `app/api/auth/[provider]/route.ts` ← 로그인 시작
- `app/api/auth/[provider]/callback/route.ts` ← 콜백
- `app/api/auth/refresh/route.ts`, `logout`, `me`
- 재사용: `providers/`, `services/auth.service`, `lib/jwt`, `lib/supabase` (거의 그대로)
- state(CSRF) 쿠키는 `cookies()` API로 처리
