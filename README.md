# crucru-auth

Google / Kakao / Naver 소셜 로그인 백엔드. OAuth2 Authorization Code 플로우를 세 provider에 대해 동일한 인터페이스로 구현하고, 사용자 정보를 **Supabase(Postgres)** 에 저장하며, 로그인 성공 시 **자체 JWT(access + refresh)** 를 발급합니다.

> Supabase Auth는 Google·Kakao는 네이티브 지원하지만 Naver는 미지원이라, 세 provider를 통일된 방식으로 다루기 위해 OAuth 플로우를 직접 구현했습니다. (Supabase는 DB + 토큰 저장소로 사용)

## 아키텍처

```
브라우저 ──GET /auth/google──▶ 백엔드 ──redirect──▶ provider 동의 화면
                                                        │
브라우저 ◀──redirect(tokens)── 백엔드 ◀──code+state──────┘
   │                              │
   │                              ├─ code → access_token 교환
   │                              ├─ access_token → 프로필 조회 (정규화)
   │                              ├─ Supabase users/social_accounts upsert
   │                              └─ 자체 JWT(access+refresh) 발급
   ▼
FRONTEND_REDIRECT_URL?access_token=...&refresh_token=...
```

핵심 추상화는 `src/providers/types.ts`의 `OAuthProvider` 인터페이스입니다. provider 추가는 파일 하나 + 레지스트리 한 줄이면 됩니다.

## 디렉토리

```
src/
  config/env.ts            환경변수 검증 (zod)
  lib/supabase.ts          service-role Supabase 클라이언트
  lib/jwt.ts               access/refresh 서명·검증, 해시
  providers/
    types.ts               OAuthProvider 인터페이스 + 정규화 프로필
    google.ts kakao.ts naver.ts
    index.ts               레지스트리
  services/auth.service.ts 유저 upsert, 토큰 발급/회전/폐기
  middleware/auth.middleware.ts  Bearer 가드 (requireAuth)
  routes/auth.routes.ts    /auth/:provider, /callback, /refresh, /logout, /me
  index.ts                 express 부트스트랩
supabase/migrations/0001_auth_schema.sql
```

## 셋업

1. 의존성 설치
   ```bash
   npm install
   ```

2. 환경변수
   ```bash
   cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
   ```
   `.env`를 채웁니다. JWT 시크릿은 충분히 긴 랜덤 문자열로:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

3. DB 스키마 적용
   `supabase/migrations/0001_auth_schema.sql`을 Supabase SQL editor에 붙여넣거나 `supabase db push`.

4. 실행
   ```bash
   npm run dev      # tsx watch
   # 또는
   npm run build && npm start
   ```

## provider 콘솔 설정 (Redirect URI 등록 필수)

각 provider 개발자 콘솔에 아래 callback URL을 등록해야 합니다 (운영에서는 도메인 교체):

| Provider | Redirect URI | 발급처 |
|----------|--------------|--------|
| Google | `http://localhost:4000/auth/google/callback` | console.cloud.google.com → OAuth 2.0 클라이언트 ID |
| Kakao  | `http://localhost:4000/auth/kakao/callback`  | developers.kakao.com → 앱 → 카카오 로그인 → Redirect URI. REST API 키 = `KAKAO_CLIENT_ID`. 동의항목에서 이메일/닉네임/프로필 활성화 |
| Naver  | `http://localhost:4000/auth/naver/callback`  | developers.naver.com → 애플리케이션 등록 |

## 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET  | `/auth/:provider` | 로그인 시작 (provider로 redirect) |
| GET  | `/auth/:provider/callback` | provider 콜백 → 토큰 발급 후 프론트로 redirect |
| POST | `/auth/refresh` `{ refreshToken }` | refresh 토큰 회전, 새 토큰 쌍 반환 |
| POST | `/auth/logout` `{ refreshToken }` | refresh 토큰 폐기 |
| GET  | `/auth/me` (Bearer) | 현재 사용자 |
| GET  | `/health` | 헬스체크 |

### 응답 예 (`/auth/refresh`)
```json
{ "accessToken": "...", "refreshToken": "...", "expiresIn": 900 }
```

## 보안 노트

- **state(CSRF)**: 로그인 시작 시 랜덤 state를 httpOnly 쿠키에 저장하고 콜백에서 대조. Naver는 토큰 교환 단계에도 동일 state 전달.
- **service-role 키**: 서버 전용. 절대 브라우저로 노출 금지. RLS는 켜두되 정책 없음 → anon 키로는 접근 불가.
- **refresh 토큰**: jti의 sha256 해시만 DB 저장. 회전(rotation) 시 단일 사용 후 폐기 → 재사용 방어.
- **토큰 전달**: 현재는 콜백에서 프론트 URL 쿼리로 전달. 보안을 더 높이려면 httpOnly 쿠키 또는 1회용 교환 코드 방식으로 바꾸세요 (`auth.routes.ts` 콜백 끝부분).
