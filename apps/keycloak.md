# Next.js (sim) Keycloak 인증 + i18n + Toast 설정 가이드

## 📦 필요한 라이브러리 설치

```bash
bun add keycloak-js react-i18next i18next react-toastify
```

## 🔧 구현 단계

### 1. lib/auth/KeycloakService.ts

```typescript
import Keycloak from "keycloak-js";

export class KeycloakService {
  private static instance: Keycloak | null = null;

  static getInstance(): Keycloak {
    if (!this.instance) {
      this.instance = new Keycloak({
        url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
        realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "",
        clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
      });
    }
    return this.instance;
  }
}

export const initKeycloak = async (
  options: Keycloak.KeycloakInitOptions
): Promise<boolean> => {
  const keycloak = KeycloakService.getInstance();
  return await keycloak.init(options);
};
```

### 2. lib/i18n/index.ts

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 번역 리소스
const resources = {
  ko: {
    translation: {
      // 한국어 번역
    },
  },
  en: {
    translation: {
      // 영어 번역
    },
  },
};

export const initializeI18n = () => {
  i18n.use(initReactI18next).init({
    resources,
    lng: "ko", // 기본 언어
    fallbackLng: "ko",
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
};
```

### 3. app/providers.tsx (⭐ 핵심)

```typescript
'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import { KeycloakProvider } from './lib/auth/KeycloakProvider';
import { initializeI18n } from './lib/i18n';
import 'react-toastify/dist/ReactToastify.css';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  const [i18nInstance] = useState(() => initializeI18n());

  return (
    <KeycloakProvider>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18nInstance}>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </I18nextProvider>
      </QueryClientProvider>
    </KeycloakProvider>
  );
}
```

### 4. app/lib/auth/KeycloakProvider.tsx

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Keycloak from 'keycloak-js';
import { KeycloakService, initKeycloak } from './index';

interface KeycloakContextType {
  keycloak: Keycloak | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  init: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const KeycloakContext = createContext<KeycloakContextType>({
  keycloak: null,
  isAuthenticated: false,
  isLoading: true,
  init: async () => false,
  logout: async () => {},
});

export const useKeycloak = () => useContext(KeycloakContext);

interface KeycloakProviderProps {
  children: ReactNode;
  initOptions?: Keycloak.KeycloakInitOptions;
}

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({
  children,
  initOptions = {
    onLoad: 'login-required',
    silentCheckSsoFallback: false,
    checkLoginIframe: false,
  },
}) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const setupTokenRefresh = (keycloakInstance: Keycloak) => {
    keycloakInstance.onTokenExpired = () => {
      console.log('Token expired, attempting to refresh');
      keycloakInstance
        .updateToken(30)
        .then((refreshed) => {
          if (refreshed) {
            console.log('Token refreshed successfully');
          }
        })
        .catch((error) => {
          console.error('Failed to refresh token:', error);
          logout();
        });
    };
  };

  const init = async (): Promise<boolean> => {
    if (initialized) {
      return keycloak?.authenticated ?? false;
    }

    try {
      const keycloakInstance = KeycloakService.getInstance();
      setKeycloak(keycloakInstance);

      const authenticated = await initKeycloak(initOptions);

      setInitialized(true);
      setIsAuthenticated(authenticated);

      if (authenticated) {
        console.debug('User is authenticated');
        setupTokenRefresh(keycloakInstance);
      }

      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (!keycloak) return;
    try {
      localStorage.clear();
      await keycloak.logout({
        redirectUri: window.location.origin
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    init();

    return () => {
      if (keycloak) {
        keycloak.onTokenExpired = undefined;
      }
    };
  }, []);

  const contextValue: KeycloakContextType = {
    keycloak,
    isAuthenticated,
    isLoading,
    init,
    logout,
  };

  return (
    <KeycloakContext.Provider value={contextValue}>
      {children}
    </KeycloakContext.Provider>
  );
};
```

### 5. app/layout.tsx (루트 레이아웃)

```typescript
import { Providers } from './providers';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 6. .env.local (환경 변수)

```env
NEXT_PUBLIC_KEYCLOAK_URL=https://your-keycloak-url
NEXT_PUBLIC_KEYCLOAK_REALM=your-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=your-client-id
```

## ⚠️ 주의사항

1. **'use client' 지시어**: Provider 컴포넌트들은 모두 클라이언트 컴포넌트여야 합니다
2. **환경 변수**: `NEXT_PUBLIC_` 접두사가 있어야 클라이언트에서 접근 가능
3. **Keycloak 초기화**: 브라우저 환경에서만 동작하므로 서버 컴포넌트에서 직접 사용 불가
4. **기존 react-query**: 이미 설정되어 있다면 기존 QueryClient 설정 유지

## 🔄 React (CRA) → Next.js 주요 차이점

| React (CRA)                           | Next.js                               |
| ------------------------------------- | ------------------------------------- |
| `main.tsx`에서 ReactDOM.render        | `layout.tsx`에서 자동 렌더링          |
| `initializeLibraries()` 비동기 초기화 | Provider 내부에서 `useState`로 초기화 |
| `index.html` 엔트리 포인트            | `app/layout.tsx` 루트 레이아웃        |
| 클라이언트 사이드만 렌더링            | 서버/클라이언트 하이브리드 렌더링     |
