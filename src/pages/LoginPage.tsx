import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchAuthorizeUrl, login } from '../features/auth/api/authApi'
import { safeNext, saveLoginAttempt } from '../features/auth/api/loginAttempt'
import { errorMessage } from '../shared/api/client'
import { tokenStore } from '../shared/auth/tokenStore'

function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(undefined)
    try {
      const tokens = await login(email.trim(), password)
      tokenStore.save(tokens.accessToken, tokens.refreshToken)
      navigate(next, { replace: true })
    } catch (cause) {
      setError(errorMessage(cause))
      setPending(false)
    }
  }

  const startKakaoLogin = async () => {
    setPending(true)
    setError(undefined)
    try {
      const { authorizeUrl, state } = await fetchAuthorizeUrl()
      saveLoginAttempt({ state, next })
      window.location.assign(authorizeUrl)
    } catch (cause) {
      setError(errorMessage(cause))
      setPending(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="content">
        <div className="screen-intro">
          <p className="small-label">동네 한 칸</p>
          <h2>
            나의 동네를
            <br />한 칸씩 채워볼까요?
          </h2>
          <p>담은 코스와 다녀온 기록은 로그인하면 이어서 볼 수 있어요.</p>
        </div>

        <label htmlFor="email" className="field-label">
          이메일
        </label>
        <input
          id="email"
          className="text-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
        {error && <p className="notice">{error}</p>}

        <div className="text-link-row">
          <Link to={`/signup/email?next=${encodeURIComponent(next)}`}>이메일로 가입하기</Link>
          <Link to="/password-reset/request">비밀번호 찾기</Link>
        </div>
      </div>
      <div className="actions">
        <button type="submit" className="primary" disabled={pending || !email.trim() || !password}>
          로그인 <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="kakao spaced" disabled={pending} onClick={startKakaoLogin}>
          카카오로 시작하기
        </button>
      </div>
    </form>
  )
}

export default LoginPage
