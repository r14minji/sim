import { KeycloakService } from '@/lib/auth/keycloak/service'

/**
 * Keycloak 토큰을 갱신합니다.
 * @returns 갱신 성공 여부
 */
export const refreshToken = async (): Promise<boolean> => {
  try {
    const keycloak = KeycloakService.getInstance()

    if (!keycloak.authenticated) {
      console.warn('User is not authenticated, cannot refresh token')
      return false
    }

    // Keycloak의 updateToken 메서드 사용 (30초 이내 만료 시 갱신)
    const refreshed = await keycloak.updateToken(30)

    if (refreshed) {
      console.log('Token refreshed successfully')
      return true
    } else {
      console.log('Token is still valid, no refresh needed')
      return true
    }
  } catch (error) {
    console.error('Failed to refresh token:', error)
    return false
  }
}

/**
 * 인증 오류 처리 (로그아웃 및 리다이렉트)
 */
export const handleAuthError = (): void => {
  console.warn('Authentication error detected, redirecting to login...')

  const keycloak = KeycloakService.getInstance()

  // localStorage 정리
  if (typeof window !== 'undefined') {
    localStorage.clear()
  }

  // Keycloak 로그아웃 및 로그인 페이지로 리다이렉트
  keycloak
    .logout({
      redirectUri: typeof window !== 'undefined' ? window.location.origin : undefined,
    })
    .catch((error) => {
      console.error('Logout failed:', error)
      // 강제 로그인 페이지로 이동
      if (typeof window !== 'undefined') {
        window.location.href = keycloak.createLoginUrl()
      }
    })
}

/**
 * 현재 유효한 Keycloak 토큰을 가져옵니다.
 * 필요 시 자동으로 갱신합니다.
 * @returns 유효한 토큰 또는 null
 */
export const getValidToken = async (): Promise<string | null> => {
  try {
    const keycloak = KeycloakService.getInstance()

    if (!keycloak.authenticated) {
      return null
    }

    // 토큰이 5분 이내에 만료되면 갱신
    await keycloak.updateToken(300)

    return keycloak.token || null
  } catch (error) {
    console.error('Failed to get valid token:', error)
    return null
  }
}
