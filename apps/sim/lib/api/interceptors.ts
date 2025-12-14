import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { KeycloakService } from '@/lib/auth/keycloak/service'
import { refreshToken, handleAuthError } from './authHandlers'
import { ApiError, getErrorMessage } from './errorHandlers'

// 재시도 설정을 가진 확장 타입
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

/**
 * 응답 인터셉터 설정
 * - 401 에러 시 토큰 갱신 후 재시도
 * - 에러 메시지 표준화
 */
export const setupResponseInterceptor = (axiosClient: AxiosInstance): void => {
  axiosClient.interceptors.response.use(
    // 성공 응답 처리 - data만 반환
    (response: AxiosResponse) => response.data,

    // 에러 응답 처리
    async (error: AxiosError) => {
      const originalRequest = error.config
      const status = error.response?.status

      // 401 오류이며, 재시도하지 않은 요청인 경우 토큰 갱신 시도
      if (status === 401 && originalRequest && !(originalRequest as RetryConfig)._retry) {
        try {
          console.log('Received 401 error, attempting to refresh token...')
          const refreshed = await refreshToken()

          if (refreshed) {
            // 재시도 플래그 설정
            ;(originalRequest as RetryConfig)._retry = true

            // 갱신된 토큰으로 헤더 업데이트
            const keycloak = KeycloakService.getInstance()
            if (keycloak.token) {
              originalRequest.headers.Authorization = `Bearer ${keycloak.token}`
            }

            console.log('Token refreshed, retrying original request...')
            return axiosClient(originalRequest)
          } else {
            throw new Error('Token refresh failed')
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError)
          handleAuthError()
          return Promise.reject(
            new ApiError('인증 세션이 만료되었습니다.', 401, error.response?.data)
          )
        }
      }

      // 기타 에러 처리
      const errorMessage = getErrorMessage(error)
      const apiError = new ApiError(errorMessage, status || 0, error.response?.data)

      console.error('API Error:', {
        message: errorMessage,
        status,
        data: error.response?.data,
        url: originalRequest?.url,
      })

      return Promise.reject(apiError)
    }
  )
}
