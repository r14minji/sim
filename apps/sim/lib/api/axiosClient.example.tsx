/**
 * Axios Client 사용 예시
 *
 * 외부 API 호출 시 Keycloak 토큰이 자동으로 주입됩니다.
 */

'use client'

import { axiosClient } from './axiosClient'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'

// ===================================
// 예시 1: 기본 GET 요청
// ===================================
export function BasicGetExample() {
  const [data, setData] = useState<any>(null)

  const fetchData = async () => {
    try {
      // Keycloak 토큰이 자동으로 헤더에 포함됩니다
      const response = await axiosClient.get('/endpoint')
      setData(response)
      console.log('Response:', response)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <button onClick={fetchData}>데이터 가져오기</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}

// ===================================
// 예시 2: POST 요청
// ===================================
export function PostExample() {
  const createItem = async () => {
    try {
      const response = await axiosClient.post('/items', {
        name: 'New Item',
        description: 'Item description',
      })
      console.log('Created:', response)
      return response
    } catch (error) {
      console.error('Failed to create item:', error)
      throw error
    }
  }

  return <button onClick={createItem}>아이템 생성</button>
}

// ===================================
// 예시 3: React Query와 함께 사용
// ===================================

// 데이터 타입 정의
interface Item {
  id: string
  name: string
  createdAt: string
}

export function ReactQueryExample() {
  // GET 요청 - useQuery
  const { data, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      // axiosClient는 response.data를 자동으로 반환합니다
      const items = await axiosClient.get<Item[]>('/items')
      return items
    },
  })

  // POST 요청 - useMutation
  const createMutation = useMutation({
    mutationFn: async (newItem: { name: string }) => {
      return await axiosClient.post<Item>('/items', newItem)
    },
    onSuccess: (data) => {
      console.log('Item created:', data)
    },
    onError: (error) => {
      console.error('Failed to create item:', error)
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>Items</h2>
      <ul>
        {data?.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <button onClick={() => createMutation.mutate({ name: 'New Item' })}>
        아이템 추가
      </button>
    </div>
  )
}

// ===================================
// 예시 4: 다양한 HTTP 메서드
// ===================================
export function HttpMethodsExample() {
  const examples = {
    // GET
    get: () => axiosClient.get('/users'),

    // GET with params
    getWithParams: () =>
      axiosClient.get('/users', {
        params: { page: 1, limit: 10 },
      }),

    // POST
    post: () =>
      axiosClient.post('/users', {
        name: 'John Doe',
        email: 'john@example.com',
      }),

    // PUT
    put: () =>
      axiosClient.put('/users/123', {
        name: 'Jane Doe',
      }),

    // PATCH
    patch: () =>
      axiosClient.patch('/users/123', {
        email: 'jane@example.com',
      }),

    // DELETE
    delete: () => axiosClient.delete('/users/123'),
  }

  return (
    <div>
      <button onClick={examples.get}>GET</button>
      <button onClick={examples.getWithParams}>GET with params</button>
      <button onClick={examples.post}>POST</button>
      <button onClick={examples.put}>PUT</button>
      <button onClick={examples.patch}>PATCH</button>
      <button onClick={examples.delete}>DELETE</button>
    </div>
  )
}

// ===================================
// 예시 5: 에러 처리
// ===================================
import { ApiError } from './errorHandlers'

export function ErrorHandlingExample() {
  const handleApiCall = async () => {
    try {
      const data = await axiosClient.get('/endpoint')
      console.log('Success:', data)
    } catch (error) {
      if (error instanceof ApiError) {
        // ApiError 타입의 에러
        console.error('API Error:', {
          message: error.message,
          status: error.status,
          data: error.data,
        })

        // 상태 코드별 처리
        switch (error.status) {
          case 400:
            alert('잘못된 요청입니다.')
            break
          case 401:
            // 401은 interceptor에서 자동으로 처리되지만, 여기서도 추가 처리 가능
            console.log('인증 오류 - 이미 처리됨')
            break
          case 403:
            alert('접근 권한이 없습니다.')
            break
          case 404:
            alert('리소스를 찾을 수 없습니다.')
            break
          case 500:
            alert('서버 오류가 발생했습니다.')
            break
        }
      } else {
        // 기타 에러
        console.error('Unexpected error:', error)
      }
    }
  }

  return <button onClick={handleApiCall}>API 호출 (에러 처리 포함)</button>
}

// ===================================
// 예시 6: Custom Headers
// ===================================
export function CustomHeadersExample() {
  const callWithCustomHeaders = async () => {
    try {
      const response = await axiosClient.get('/endpoint', {
        headers: {
          'X-Custom-Header': 'custom-value',
          'X-Request-ID': crypto.randomUUID(),
        },
      })
      console.log('Response:', response)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return <button onClick={callWithCustomHeaders}>커스텀 헤더로 호출</button>
}

// ===================================
// 예시 7: File Upload
// ===================================
export function FileUploadExample() {
  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('description', 'File description')

    try {
      const response = await axiosClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          console.log(`Upload progress: ${percentCompleted}%`)
        },
      })
      console.log('Upload success:', response)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) uploadFile(file)
      }}
    />
  )
}
