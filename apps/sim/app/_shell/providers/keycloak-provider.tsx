'use client'

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Keycloak from 'keycloak-js'
import { KeycloakService, initKeycloak } from '@/lib/auth/keycloak/service'
import { env } from '@/lib/core/config/env'

interface KeycloakContextType {
  keycloak: Keycloak | null
  isAuthenticated: boolean
  isLoading: boolean
  init: () => Promise<boolean>
  logout: () => Promise<void>
  getToken: () => string | undefined
}

const KeycloakContext = createContext<KeycloakContextType>({
  keycloak: null,
  isAuthenticated: false,
  isLoading: true,
  init: async () => false,
  logout: async () => {},
  getToken: () => undefined,
})

export const useKeycloak = () => useContext(KeycloakContext)

interface KeycloakProviderProps {
  children: ReactNode
  initOptions?: Keycloak.KeycloakInitOptions
}

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({
  children,
  initOptions = {
    onLoad: 'check-sso', // 로그인 페이지로 자동 리다이렉트 안 함 (선택적 인증)
    silentCheckSsoRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/silent-check-sso.html` : undefined,
    checkLoginIframe: false, // iframe을 통한 세션 체크 비활성화
  },
}) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Keycloak 설정이 되어 있는지 확인
  const isKeycloakConfigured =
    env.NEXT_PUBLIC_KEYCLOAK_URL &&
    env.NEXT_PUBLIC_KEYCLOAK_REALM &&
    env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID

  const setupTokenRefresh = (keycloakInstance: Keycloak) => {
    keycloakInstance.onTokenExpired = () => {
      console.log('Keycloak token expired, attempting to refresh')
      keycloakInstance
        .updateToken(30) // 30초 전에 갱신
        .then((refreshed) => {
          if (refreshed) {
            console.log('Keycloak token refreshed successfully')
          }
        })
        .catch((error) => {
          console.error('Failed to refresh Keycloak token:', error)
          logout()
        })
    }
  }

  const init = async (): Promise<boolean> => {
    if (initialized) {
      return keycloak?.authenticated ?? false
    }

    if (!isKeycloakConfigured) {
      console.warn('Keycloak is not configured. Skipping initialization.')
      setIsLoading(false)
      setInitialized(true)
      return false
    }

    try {
      const keycloakInstance = KeycloakService.getInstance()
      setKeycloak(keycloakInstance)

      const authenticated = await initKeycloak(initOptions)

      setInitialized(true)
      setIsAuthenticated(authenticated)

      if (authenticated) {
        console.debug('User is authenticated with Keycloak')
        setupTokenRefresh(keycloakInstance)
      } else {
        console.debug('User is not authenticated with Keycloak')
      }

      return authenticated
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    if (!keycloak) return
    try {
      localStorage.clear()
      await keycloak.logout({
        redirectUri: typeof window !== 'undefined' ? window.location.origin : undefined,
      })
    } catch (error) {
      console.error('Keycloak logout failed:', error)
      throw error
    }
  }

  const getToken = (): string | undefined => {
    return keycloak?.token
  }

  useEffect(() => {
    // 브라우저 환경에서만 초기화
    if (typeof window !== 'undefined') {
      init()
    }

    return () => {
      if (keycloak) {
        keycloak.onTokenExpired = undefined
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const contextValue: KeycloakContextType = {
    keycloak,
    isAuthenticated,
    isLoading,
    init,
    logout,
    getToken,
  }

  return <KeycloakContext.Provider value={contextValue}>{children}</KeycloakContext.Provider>
}
