const ACCESS_TOKEN_KEY = 'dongne.accessToken'
const REFRESH_TOKEN_KEY = 'dongne.refreshToken'

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export const tokenStore = {
  accessToken: () => read(ACCESS_TOKEN_KEY),
  refreshToken: () => read(REFRESH_TOKEN_KEY),
  isLoggedIn: () => read(REFRESH_TOKEN_KEY) !== null,
  save(accessToken: string, refreshToken: string) {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    } catch {
      // 저장소를 쓸 수 없으면 비회원 상태로 둔다.
    }
  },
  clear() {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch {
      // 지울 수 없어도 화면 상태는 비회원으로 돌아간다.
    }
  },
}
