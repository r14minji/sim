# React to Next.js 마이그레이션 계획

## 개요

React 애플리케이션을 Next.js 기반 애플리케이션으로 통합하는 프로젝트입니다.

### 주요 목표

- React 앱의 모든 페이지를 Next.js로 이관
- 인증 시스템을 Keycloak으로 통일
- 기존 URL 구조 유지하면서 Next.js 컴포넌트 활용

---

## Phase 1: 인증 시스템 전환

### 1.1 현재 상태 분석

**Next.js 기존 인증**

- 경로: `/login`, `/signup`, `/sso`, `/verify`, `/reset-password`
- 현재 인증 방식: (기존 Next.js 인증 시스템)

**React 기존 인증**

- Keycloak 기반 인증 시스템

### 1.2 작업 내용

#### Step 1.1: Next.js 기존 인증 제거

- [ ] `/login` 페이지 제거 또는 Keycloak 리다이렉트로 변경
- [ ] `/signup` 페이지 제거 또는 Keycloak 리다이렉트로 변경
- [ ] `/sso` 페이지 제거 또는 Keycloak 통합
- [ ] `/verify` 페이지 제거
- [ ] `/reset-password` 페이지 제거
- [ ] 기존 인증 관련 API 라우트 제거
- [ ] 기존 인증 관련 미들웨어 제거

#### Step 1.2: Keycloak 통합

- [ ] Keycloak 클라이언트 라이브러리 설치
  - `keycloak-js` 또는 `@react-keycloak/nextjs`
- [ ] Keycloak 설정 파일 생성
  ```typescript
  // lib/keycloak.ts
  export const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  };
  ```
- [ ] Keycloak Provider 설정
  - `app/providers/KeycloakProvider.tsx` 생성
  - Root Layout에 Provider 추가
- [ ] 인증 미들웨어 구현
  - `middleware.ts`에 Keycloak 토큰 검증 로직 추가
  - Protected 라우트 정의
- [ ] 인증 헬퍼 함수/훅 구현
  - `useAuth()` 훅
  - `getToken()` 함수
  - `isAuthenticated()` 함수

#### Step 1.3: 환경 변수 설정

```env
NEXT_PUBLIC_KEYCLOAK_URL=https://your-keycloak-server
NEXT_PUBLIC_KEYCLOAK_REALM=your-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=your-client-id
```

#### Step 1.4: 테스트

- [ ] 로그인 플로우 테스트
- [ ] 로그아웃 플로우 테스트
- [ ] 토큰 갱신 테스트
- [ ] Protected 라우트 접근 테스트

---

## Phase 2: 핵심 페이지 마이그레이션 (Workflow)

### 2.1 현재 상태

**React 구조**

- 경로: `/[projectId]/console/route`
- 기능: 프로젝트의 워크플로우 관리

**Next.js 구조**

- 경로: `/workspace/[workspaceId]/w/[workflowId]`
- 컴포넌트: 워크플로우 에디터 및 관리 컴포넌트

### 2.2 작업 내용

#### Step 2.1: 라우팅 구조 변경

- [ ] 새로운 라우트 생성: `app/[projectId]/console/route/page.tsx`
- [ ] 기존 Next.js 워크플로우 컴포넌트 재사용

  ```typescript
  // app/[projectId]/console/route/page.tsx
  import WorkflowEditor from '@/components/workspace/WorkflowEditor'

  export default function ProjectConsolRoute({ params }) {
    // projectId를 workspaceId로 매핑
    // route 기능을 workflow로 매핑
    return <WorkflowEditor projectId={params.projectId} />
  }
  ```

#### Step 2.2: 컴포넌트 마이그레이션

- [ ] React의 `/console/route` 컴포넌트 분석
- [ ] Next.js의 `/workspace/[workspaceId]/w/[workflowId]` 컴포넌트와 기능 매핑
- [ ] 필요한 props 및 state 구조 정의
- [ ] 컴포넌트 재사용 또는 어댑터 패턴 적용

#### Step 2.3: 데이터 계층 통합

- [ ] API 엔드포인트 매핑
  - React: `/api/projects/[projectId]/routes`
  - Next.js: `/api/workspace/[workspaceId]/workflows`
- [ ] 데이터 구조 변환 로직 구현
- [ ] State 관리 통합 (React Query, Zustand 등)

#### Step 2.4: URL 파라미터 처리

```typescript
// lib/route-mapping.ts
export function mapProjectToWorkspace(projectId: string) {
  // projectId → workspaceId 매핑 로직
}

export function mapRouteToWorkflow(routeId: string) {
  // routeId → workflowId 매핑 로직
}
```

#### Step 2.5: 테스트

- [ ] 기존 `/[projectId]/console/route` URL 접근 테스트
- [ ] 컴포넌트 렌더링 테스트
- [ ] 데이터 로딩 및 저장 테스트
- [ ] 사용자 인터랙션 테스트

---

## Phase 3: 전체 페이지 마이그레이션

### 3.1 우선순위별 페이지 분류

#### 우선순위 1: 핵심 기능

- [ ] `/` (대시보드)
- [ ] `/[projectId]/console` (프로젝트 콘솔)
- [ ] `/[projectId]/console/models` (모델 관리)
- [ ] `/projects` (프로젝트 목록)

#### 우선순위 2: 관리 기능

각 페이지에 대해 다음을 수행:

```markdown
#### `/페이지경로`

- [ ] 페이지 컴포넌트 생성
- [ ] 레이아웃 적용
- [ ] 데이터 패칭 로직 구현
- [ ] API 라우트 연결
- [ ] 권한 체크 적용
- [ ] 스타일링 적용
- [ ] 테스트 작성
- [ ] QA 완료
```

---

## Phase 4: Next.js 기존 페이지 통합

### 4.1 유지할 페이지

## Phase 5: 라우팅 및 네비게이션 통합

### 5.1 라우팅 구조 정리

```
app/
├── (auth)/              # Keycloak 인증
│   └── login/
├── (public)/
│   ├── page.tsx         # 대시보드
│   ├── chat/
│   ├── templates/
│   └── invite/
├── [projectId]/
│   └── console/
│       ├── page.tsx
│       ├── route/       # ← Step 2에서 마이그레이션
│       ├── members/
│       ├── models/
│       ├── prompt-playground/
│       └── history/
├── projects/
├── users/
├── groups/
├── model-credential/
├── deployed-model/
├── notices/
├── history/
├── usages/
├── infra/
├── data/
└── workspace/           # 기존 Next.js 페이지
```

### 5.2 네비게이션 컴포넌트 통합

---

## Phase 6: 상태 관리 및 데이터 패칭

### 6.1 상태 관리 통합

- [ ] 통합 상태 관리 전략 수립 (Zustand, React Query 등)

### 6.2 API 클라이언트 통합

- [ ] Axios/Fetch 클라이언트 통합
- [ ] API 베이스 URL 설정
- [ ] 에러 핸들링 통합
- [ ] 인터셉터 설정 (Keycloak 토큰 주입)

### 6.3 Server Components vs Client Components

- [ ] 페이지별 Server/Client Component 분류
- [ ] 데이터 패칭 전략 수립 (Server-side, Client-side, Hybrid)

---

## Phase 7: 스타일 및 UI 통합

### 7.1 스타일 시스템 통합

- [ ] CSS/SCSS 모듈 통합
- [ ] Tailwind CSS 설정 통합
- [ ] 디자인 시스템 통합 (shadcn/ui 등)
- [ ] 테마 설정 통합 (다크모드 등)

### 7.2 공통 컴포넌트 통합

- [ ] 버튼, 입력 필드 등 기본 컴포넌트
- [ ] 모달, 드롭다운 등 복합 컴포넌트
- [ ] 레이아웃 컴포넌트

---

## 참고 사항

### 기술 스택

- **Frontend**: Next.js 14+ (App Router)
- **인증**: Keycloak
- **상태 관리**: TBD (React Query, Zustand 등)
- **스타일링**: TBD (Tailwind CSS, shadcn/ui 등)
- **배포**: Vercel / Custom Server
