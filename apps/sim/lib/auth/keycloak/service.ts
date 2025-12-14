import Keycloak from 'keycloak-js'
import { env } from '@/lib/core/config/env'

/**
 * Keycloak 싱글톤 서비스
 * 클라이언트 사이드에서 Keycloak 인증을 관리합니다.
 */
export class KeycloakService {
  private static instance: Keycloak | null = null
  private static isInitializing: boolean = false
  private static initPromise: Promise<boolean> | null = null

  static getInstance(): Keycloak {
    if (!this.instance) {
      // NEXT_PUBLIC_ 환경 변수 사용 (클라이언트에서 접근 가능)
      const keycloakUrl = env.NEXT_PUBLIC_KEYCLOAK_URL
      const keycloakRealm = env.NEXT_PUBLIC_KEYCLOAK_REALM
      const keycloakClientId = env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID

      if (!keycloakUrl || !keycloakRealm || !keycloakClientId) {
        throw new Error(
          'Keycloak configuration is missing. Please set NEXT_PUBLIC_KEYCLOAK_URL, NEXT_PUBLIC_KEYCLOAK_REALM, and NEXT_PUBLIC_KEYCLOAK_CLIENT_ID environment variables.'
        )
      }

      this.instance = new Keycloak({
        url: keycloakUrl,
        realm: keycloakRealm,
        clientId: keycloakClientId,
      })
    }
    return this.instance
  }

  static async initialize(options: Keycloak.KeycloakInitOptions): Promise<boolean> {
    // 이미 초기화 중이면 기존 Promise 반환
    if (this.initPromise) {
      return this.initPromise
    }

    // 초기화 중 플래그 확인
    if (this.isInitializing) {
      return new Promise((resolve) => {
        const checkInitialization = setInterval(() => {
          if (!this.isInitializing) {
            clearInterval(checkInitialization)
            resolve(this.instance?.authenticated ?? false)
          }
        }, 100)
      })
    }

    this.isInitializing = true
    const keycloak = this.getInstance()

    this.initPromise = keycloak.init(options)

    try {
      const result = await this.initPromise
      return result
    } finally {
      this.isInitializing = false
    }
  }

  static reset(): void {
    this.instance = null
    this.isInitializing = false
    this.initPromise = null
  }
}

/**
 * Keycloak을 초기화하는 함수
 * @param options Keycloak 초기화 옵션
 * @returns 인증 여부 (boolean)
 */
export const initKeycloak = async (options: Keycloak.KeycloakInitOptions): Promise<boolean> => {
  try {
    return await KeycloakService.initialize(options)
  } catch (error) {
    console.error('Keycloak initialization failed:', error)
    return false
  }
}
