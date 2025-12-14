# 개발 모드 인증 비활성화 가이드

## 개요

개발/테스트 목적으로 인증을 완전히 우회하여 모든 API를 로그인 없이 사용할 수 있습니다.

## 빠른 시작

### 1. 환경 변수 설정

`.env` 파일에 다음을 추가:

```env
DISABLE_AUTH=true
```

### 2. 서버 재시작

```bash
bun run dev
```

### 3. 완료!

이제 로그인 없이 모든 API와 페이지에 접근할 수 있습니다.

## 사용 방법

### 옵션 1: 가짜 사용자 사용 (기본)

```env
DISABLE_AUTH=true
```

- **사용자 ID**: `dev-user-123`
- **이메일**: `dev@example.com`
- **이름**: `Dev User`

이 가짜 사용자는 DB에 존재하지 않습니다. 대부분의 API 테스트에 충분합니다.

### 옵션 2: 실제 DB 사용자 사용 (권장)

```env
DISABLE_AUTH=true
TEST_USER_ID=clxxx-your-real-user-id
TEST_ORG_ID=your-real-org-id
```

1. DB에서 실제 사용자 ID를 조회:
   ```sql
   SELECT id, email, name FROM "user" LIMIT 1;
   ```

2. `.env`에 해당 사용자 ID 설정:
   ```env
   TEST_USER_ID=clxxabcd1234  # DB에서 조회한 실제 ID
   ```

3. Organization이 필요한 경우:
   ```sql
   SELECT id, name FROM "organization" LIMIT 1;
   ```

   ```env
   TEST_ORG_ID=org-id-from-db
   ```

## 동작 확인

### 콘솔 로그 확인

서버 시작 시 다음과 같은 로그가 출력됩니다:

```
🚨 AUTH DISABLED - Using hardcoded session
✅ Using test user: user@example.com (clxxabcd1234)
```

또는 가짜 사용자 사용 시:

```
🚨 AUTH DISABLED - Using hardcoded session
⚠️  Using hardcoded fake user (dev-user-123)
```

### API 테스트

로그인 없이 바로 API 호출:

```bash
# Workspace 조회
curl http://localhost:3000/api/workspaces

# Workflow 조회
curl http://localhost:3000/api/workflows
```

## 주의사항

### ⚠️ 프로덕션 안전 장치

프로덕션 환경에서는 절대로 인증이 비활성화되지 않습니다:

```typescript
if (process.env.NODE_ENV === 'production' && DISABLE_AUTH === 'true') {
  throw new Error('🚨 CRITICAL: Cannot disable auth in production!')
}
```

### ⚠️ 보안

이 기능은 개발/테스트 환경에서만 사용하세요:

- `.env` 파일을 Git에 커밋하지 마세요
- 로컬 개발 환경에서만 사용하세요
- 절대로 외부에 노출되는 서버에서 사용하지 마세요

## 구현 세부사항

### 수정된 파일

1. **`lib/auth/index.ts`**
   - `getSession()` 함수 하드코딩 우회
   - 실제 DB 사용자 또는 가짜 사용자 반환

2. **`middleware.ts`**
   - 미들웨어 인증 체크 우회
   - 리다이렉트 로직 스킵

3. **`.env.example`**
   - 설정 예시 추가

### 작동 원리

```
DISABLE_AUTH=true
    ↓
getSession() 호출
    ↓
실제 인증 체크 건너뛰기
    ↓
하드코딩된 사용자 정보 반환
    ↓
모든 API 정상 동작 ✅
```

## 문제 해결

### API가 401 에러를 반환하는 경우

1. 환경 변수 확인:
   ```bash
   echo $DISABLE_AUTH
   ```

2. 서버 재시작:
   ```bash
   # 완전히 종료 후 재시작
   bun run dev
   ```

3. 콘솔 로그 확인:
   - "🚨 AUTH DISABLED" 메시지가 출력되어야 함

### TEST_USER_ID를 설정했는데 작동하지 않는 경우

1. DB에서 사용자가 존재하는지 확인:
   ```sql
   SELECT * FROM "user" WHERE id = 'your-user-id';
   ```

2. DB 연결 확인:
   ```bash
   # DATABASE_URL이 올바른지 확인
   echo $DATABASE_URL
   ```

3. 콘솔 경고 확인:
   - "Failed to load test user" 경고가 있으면 DB 연결 문제

## 다시 인증 활성화

`.env`에서 해당 줄을 주석 처리하거나 삭제:

```env
# DISABLE_AUTH=true  # 주석 처리
```

또는 값을 `false`로 변경:

```env
DISABLE_AUTH=false
```

서버 재시작 후 정상적인 로그인이 필요합니다.

## FAQ

### Q: 프로덕션 배포 시 실수로 켜질 수 있나요?
**A**: 아니요. 코드에 프로덕션 안전 장치가 있어서 에러가 발생합니다.

### Q: Socket.IO 연결도 작동하나요?
**A**: 네, 하지만 Socket.IO는 one-time token이 필요하므로 별도 처리가 필요할 수 있습니다.

### Q: 가짜 사용자로도 DB 작업이 가능한가요?
**A**: 대부분의 읽기 API는 작동하지만, 쓰기 작업(CREATE/UPDATE)은 실제 DB 사용자가 필요할 수 있습니다.

### Q: Organization 관련 API는 어떻게 하나요?
**A**: `TEST_ORG_ID`를 설정하면 세션에 `activeOrganizationId`가 포함됩니다.

### Q: API Key 인증도 우회되나요?
**A**: 아니요. V1 API의 API Key 인증(`x-api-key` 헤더)은 별도로 관리됩니다.

## 참고

- Better Auth 공식 문서: https://www.better-auth.com/docs
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
