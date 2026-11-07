import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, getData, patchData, postData } from '../../../shared/api/client'
import { tokenStore } from '../../../shared/auth/tokenStore'

export const KAKAO_REDIRECT_PATH = '/oauth/kakao'

export interface AuthUser {
  userId: number
  nickname: string
  isAdmin: boolean
  onboardingCompleted: boolean
}

export interface MyInfo extends AuthUser {
  loginId: string | null
  joinedAt: string
  savedCourseCount: number
  recordCount: number
}

export interface Tokens {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export type KakaoLoginResult =
  | ({ signupRequired: false } & Tokens)
  | { signupRequired: true; signupToken: string; kakaoNickname: string | null }

export function fetchAuthorizeUrl() {
  return getData<{ authorizeUrl: string; state: string }>('/api/auth/kakao/authorize-url')
}

export function loginWithKakao(authorizationCode: string, state: string) {
  return postData<KakaoLoginResult>('/api/auth/kakao', {
    authorizationCode,
    state,
    redirectUri: `${window.location.origin}${KAKAO_REDIRECT_PATH}`,
  })
}

export function signup(signupToken: string, nickname: string) {
  return postData<Tokens>('/api/auth/signup', { signupToken, privacyAgreed: true, nickname })
}

export function checkLoginIdAvailability(loginId: string) {
  return getData<{ available: boolean }>('/api/auth/login-id-availability', { loginId })
}

export function signupLocal(loginId: string, password: string, nickname: string) {
  return postData<Tokens>('/api/auth/local/signup', { loginId, password, nickname, privacyAgreed: true })
}

export function login(loginId: string, password: string) {
  return postData<Tokens>('/api/auth/login', { loginId, password })
}

export function useMyInfo() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => getData<MyInfo>('/api/users/me'),
    enabled: tokenStore.isLoggedIn(),
    retry: false,
  })
}

function leaveAsGuest() {
  tokenStore.clear()
  window.location.assign('/')
}

export function useChangeNickname() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (nickname: string) => patchData<MyInfo>('/api/users/me', { nickname }),
    onSuccess: (myInfo) => queryClient.setQueryData(['users', 'me'], myInfo),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (passwords: { currentPassword: string; newPassword: string }) =>
      apiClient.patch('/api/users/me/password', passwords),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: () => apiClient.post('/api/auth/logout', { refreshToken: tokenStore.refreshToken() }),
    onSettled: leaveAsGuest,
  })
}

export function useWithdraw() {
  return useMutation({
    mutationFn: () => apiClient.delete('/api/users/me'),
    onSuccess: leaveAsGuest,
  })
}
