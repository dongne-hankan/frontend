import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchAuthorizeUrl, login } from '../features/auth/api/authApi'
import { safeNext, saveLoginAttempt } from '../features/auth/api/loginAttempt'
import { errorMessage } from '../shared/api/client'
import { tokenStore } from '../shared/auth/tokenStore'

function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const notice = (useLocation().state as { notice?: string } | null)?.notice
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState<'login' | 'kakao'>()
  const [error, setError] = useState<string>()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setPending('login')
    setError(undefined)
    try {
      const tokens = await login(loginId.trim(), password)
      tokenStore.save(tokens.accessToken, tokens.refreshToken)
      navigate(next, { replace: true })
    } catch (cause) {
      setError(errorMessage(cause))
      setPending(undefined)
    }
  }

  const startKakaoLogin = async () => {
    setPending('kakao')
    setError(undefined)
    try {
      const { authorizeUrl, state } = await fetchAuthorizeUrl()
      saveLoginAttempt({ state, next })
      window.location.assign(authorizeUrl)
    } catch (cause) {
      setError(errorMessage(cause))
      setPending(undefined)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="content login-content">
        <div className="screen-intro welcome-panel">
          <p className="small-label">동네 한 칸</p>
          <h2>
            나의 동네를
            <br />한 칸씩 채워볼까요?
          </h2>
          <p>담은 코스와 다녀온 기록은 로그인하면 이어서 볼 수 있어요.</p>
        </div>
        {notice && !error && <p className="notice">{notice}</p>}

        <label htmlFor="login-id" className="field-label">
          아이디
        </label>
        <input
          id="login-id"
          className="text-input"
          autoComplete="username"
          autoCapitalize="none"
          value={loginId}
          onChange={(event) => setLoginId(event.target.value)}
        />

        <label htmlFor="password" className="field-label field-gap">
          비밀번호
        </label>
        <input
          id="password"
          className="text-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}

        <div className="text-link-row">
          <Link to={`/signup/local?next=${encodeURIComponent(next)}`}>아이디로 가입하기</Link>
        </div>
      </div>
      <div className="actions login-actions">
        <button type="submit" className="primary" disabled={pending !== undefined || !loginId.trim() || !password}>
          {pending === 'login' ? '로그인하는 중…' : '로그인'} <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="kakao spaced" disabled={pending !== undefined} onClick={startKakaoLogin}>
          {pending === 'kakao' ? '카카오에 연결하는 중…' : '카카오로 시작하기'}
        </button>
      </div>
    </form>
  )
}

export default LoginPage
