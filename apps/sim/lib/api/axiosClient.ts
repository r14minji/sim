import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { KeycloakService } from '@/lib/auth/keycloak/service'
import { setupResponseInterceptor } from './interceptors'
import { env } from '@/lib/core/config/env'

/**
 * Axios 인스턴스를 생성하고 기본 설정을 적용합니다.
 * - Keycloak 토큰 자동 주입
 * - 401 에러 시 토큰 갱신 및 재시도
 * - 에러 핸들링
 */
export const createAxiosClient = (): AxiosInstance => {
  const axiosClient = axios.create({
    baseURL: env.NEXT_PUBLIC_API_BASE_URL || '',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 요청 인터셉터: Keycloak 토큰 자동 주입
  axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      try {
        const keycloak = KeycloakService.getInstance()

        // Keycloak 토큰이 있으면 Authorization 헤더에 추가
        if (keycloak.token) {
          config.headers.Authorization = `Bearer ${keycloak.token}`
        } else {
          console.warn('Keycloak token is not available')
        }
      } catch (error) {
        console.error('Failed to add Keycloak token to request:', error)
      }

      return config
    },
    (error) => {
      console.error('Request interceptor error:', error)
      return Promise.reject(error)
    }
  )

  // 응답 인터셉터 설정 (401 에러 처리, 토큰 갱신 등)
  setupResponseInterceptor(axiosClient)

  return axiosClient
}

/**
 * 기본 Axios 인스턴스
 * 외부 API 호출 시 사용합니다.
 */
export const axiosClient = createAxiosClient()
