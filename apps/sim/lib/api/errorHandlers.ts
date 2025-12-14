import { AxiosError } from 'axios'

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Axios 에러에서 사용자 친화적인 메시지를 추출합니다.
 */
export const getErrorMessage = (error: AxiosError): string => {
  // 응답이 있는 경우 (서버가 응답을 반환한 경우)
  if (error.response) {
    const { status, data } = error.response

    // 서버에서 제공한 에러 메시지 사용
    if (data && typeof data === 'object') {
      if ('message' in data && typeof data.message === 'string') {
        return data.message
      }
      if ('error' in data && typeof data.error === 'string') {
        return data.error
      }
    }

    // HTTP 상태 코드별 기본 메시지
    switch (status) {
      case 400:
        return '잘못된 요청입니다.'
      case 401:
        return '인증이 필요합니다.'
      case 403:
        return '접근 권한이 없습니다.'
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.'
      case 500:
        return '서버 오류가 발생했습니다.'
      case 502:
        return '게이트웨이 오류가 발생했습니다.'
      case 503:
        return '서비스를 일시적으로 사용할 수 없습니다.'
      default:
        return `서버 오류가 발생했습니다. (${status})`
    }
  }

  // 요청이 전송되었으나 응답이 없는 경우
  if (error.request) {
    return '서버로부터 응답이 없습니다. 네트워크 연결을 확인해주세요.'
  }

  // 요청 설정 중 오류가 발생한 경우
  return error.message || '알 수 없는 오류가 발생했습니다.'
}
