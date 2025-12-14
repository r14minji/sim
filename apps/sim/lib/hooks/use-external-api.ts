'use client'

import { useKeycloak } from '@/app/_shell/providers/keycloak-provider'
import { useCallback } from 'react'

/**
 * 외부 API 호출을 위한 커스텀 hook
 * Keycloak 토큰을 자동으로 Authorization 헤더에 포함시킵니다.
 */
export const useExternalApi = () => {
  const { keycloak, isAuthenticated, getToken } = useKeycloak()

  /**
   * 외부 API를 호출하는 함수
   * @param url - API 엔드포인트 URL
   * @param options - fetch 옵션 (headers는 자동으로 Keycloak 토큰 포함)
   * @returns fetch Response
   */
  const callExternalApi = useCallback(
    async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
      if (!isAuthenticated) {
        throw new Error('User is not authenticated with Keycloak. Please log in first.')
      }

      const token = getToken()
      if (!token) {
        throw new Error('Keycloak token is not available.')
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `External API request failed: ${response.status} ${response.statusText}. ${errorText}`
        )
      }

      return response.json()
    },
    [isAuthenticated, getToken]
  )

  /**
   * Keycloak 로그인 시작
   */
  const login = useCallback(async () => {
    if (!keycloak) {
      throw new Error('Keycloak is not initialized.')
    }
    await keycloak.login()
  }, [keycloak])

  return {
    callExternalApi,
    login,
    isAuthenticated,
    token: getToken(),
  }
}
