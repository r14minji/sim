/**
 * useExternalApi Hook 사용 예시
 *
 * 이 파일은 외부 API 호출 방법을 보여주는 예시입니다.
 */

'use client'

import { useExternalApi } from './use-external-api'
import { useKeycloak } from '@/app/_shell/providers/keycloak-provider'

/**
 * 예시 1: 외부 API 데이터 가져오기
 */
export function ExternalApiExample() {
  const { callExternalApi, isAuthenticated, login } = useExternalApi()

  const fetchExternalData = async () => {
    try {
      // Keycloak 토큰이 자동으로 Authorization 헤더에 포함됩니다
      const data = await callExternalApi('https://external-api.example.com/data')
      console.log('External API response:', data)
    } catch (error) {
      console.error('Failed to fetch external data:', error)
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={fetchExternalData}>외부 API 호출</button>
      ) : (
        <button onClick={login}>Keycloak 로그인</button>
      )}
    </div>
  )
}

/**
 * 예시 2: POST 요청으로 데이터 전송
 */
export function PostExternalDataExample() {
  const { callExternalApi, isAuthenticated } = useExternalApi()

  const postData = async () => {
    try {
      const response = await callExternalApi('https://external-api.example.com/create', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test',
          value: 123,
        }),
      })
      console.log('Created:', response)
    } catch (error) {
      console.error('Failed to post data:', error)
    }
  }

  if (!isAuthenticated) {
    return <div>Keycloak 로그인이 필요합니다.</div>
  }

  return <button onClick={postData}>데이터 전송</button>
}

/**
 * 예시 3: React Query와 함께 사용
 */
import { useQuery } from '@tanstack/react-query'

export function ReactQueryExample() {
  const { callExternalApi, isAuthenticated } = useExternalApi()

  const { data, isLoading, error } = useQuery({
    queryKey: ['externalData'],
    queryFn: () => callExternalApi<{ items: string[] }>('https://external-api.example.com/items'),
    enabled: isAuthenticated, // Keycloak 인증된 경우에만 실행
  })

  if (!isAuthenticated) {
    return <div>Keycloak 로그인이 필요합니다.</div>
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data?.items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  )
}

/**
 * 예시 4: Keycloak 토큰 직접 사용
 */
export function DirectTokenExample() {
  const { keycloak, isAuthenticated } = useKeycloak()

  const manualApiCall = async () => {
    if (!isAuthenticated || !keycloak?.token) {
      console.error('Not authenticated')
      return
    }

    // 토큰을 직접 사용하는 경우
    const response = await fetch('https://external-api.example.com/custom', {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        'X-Custom-Header': 'custom-value',
      },
    })

    const data = await response.json()
    console.log(data)
  }

  return <button onClick={manualApiCall}>커스텀 API 호출</button>
}

/**
 * 예시 5: Keycloak 로그인/로그아웃 UI
 */
export function KeycloakAuthButton() {
  const { isAuthenticated, logout } = useKeycloak()
  const { login } = useExternalApi()

  if (isAuthenticated) {
    return <button onClick={logout}>Keycloak 로그아웃</button>
  }

  return <button onClick={login}>Keycloak 로그인</button>
}
