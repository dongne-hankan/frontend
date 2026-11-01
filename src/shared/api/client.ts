import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from '../auth/tokenStore'
import type { ApiError, ApiResponse } from './types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

let refreshing: Promise<string> | null = null

function isExpired(accessToken: string) {
  try {
    const payload = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload)) as { exp: number }
    return exp * 1000 <= Date.now()
  } catch {
    return false
  }
}

function sharedRefresh() {
  refreshing ??= refreshAccessToken().finally(() => {
    refreshing = null
  })
  return refreshing
}

// 공개 API는 만료된 토큰을 비회원으로 처리하므로, 기록 반영이 빠지지 않도록 보내기 전에 재발급한다.
apiClient.interceptors.request.use(async (config) => {
  let accessToken = tokenStore.accessToken()
  if (accessToken && isExpired(accessToken)) {
    accessToken = await sharedRefresh().catch(() => null)
  }
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

async function refreshAccessToken() {
  const refreshToken = tokenStore.refreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token')
  }
  try {
    const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      `${baseURL}/api/auth/token/refresh`,
      { refreshToken },
    )
    const tokens = response.data.data
    tokenStore.save(tokens.accessToken, tokens.refreshToken)
    return tokens.accessToken
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenStore.clear()
    }
    throw error
  }
}

type RetryableConfig = InternalAxiosRequestConfig & { retried?: boolean }

apiClient.interceptors.response.use(undefined, async (error: AxiosError<ApiError>) => {
  const config = error.config as RetryableConfig | undefined
  if (error.response?.data?.code !== 'AUTH_TOKEN_EXPIRED' || !config || config.retried) {
    throw error
  }
  config.retried = true
  const accessToken = await sharedRefresh()
  config.headers.Authorization = `Bearer ${accessToken}`
  return apiClient(config)
})

export async function getData<T>(url: string, params?: object): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, { params })
  return response.data.data
}

export async function postData<T>(url: string, body?: object): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, body)
  return response.data.data
}

export async function patchData<T>(url: string, body?: object): Promise<T> {
  const response = await apiClient.patch<ApiResponse<T>>(url, body)
  return response.data.data
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error) && error.response?.data?.message) {
    const { message, errors } = error.response.data
    return errors?.[0]?.message ?? message
  }
  return '잠시 후 다시 시도해 주세요.'
}
