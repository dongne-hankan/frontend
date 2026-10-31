import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
})

// TODO(Frontend C): 요청에 Authorization 헤더를 붙이고, 401 AUTH_TOKEN_EXPIRED를 받으면 토큰을 재발급한 뒤 다시 보낸다.
