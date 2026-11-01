const KEY = 'dongne.loginAttempt'

interface LoginAttempt {
  state: string
  next: string
}

export function safeNext(next: string | null) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

export function saveLoginAttempt(attempt: LoginAttempt) {
  sessionStorage.setItem(KEY, JSON.stringify(attempt))
}

export function takeLoginAttempt(): LoginAttempt | null {
  const saved = sessionStorage.getItem(KEY)
  sessionStorage.removeItem(KEY)
  return saved ? (JSON.parse(saved) as LoginAttempt) : null
}
