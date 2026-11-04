import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { confirmPasswordReset } from '../features/auth/api/authApi'
import { errorMessage } from '../shared/api/client'
import { tokenStore } from '../shared/auth/tokenStore'

function PasswordResetPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [password, setPassword] = useState('')
  const [passwordAgain, setPasswordAgain] = useState('')
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  if (!token) {
    return (
      <div className="content">
        <p className="state">재설정 링크가 올바르지 않아요. 다시 요청해 주세요.</p>
        <Link className="primary" to="/password-reset/request">
          다시 요청하기 <span aria-hidden="true">→</span>
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="content">
        <div className="screen-intro">
          <p className="small-label">비밀번호 재설정</p>
          <h2>비밀번호를 바꿨어요</h2>
          <p>모든 기기에서 로그아웃했어요. 새 비밀번호로 다시 로그인해 주세요.</p>
        </div>
        <Link className="primary" to="/login">
          로그인하기 <span aria-hidden="true">→</span>
        </Link>
      </div>
    )
  }

  const mismatch = passwordAgain.length > 0 && password !== passwordAgain

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(undefined)
    try {
      await confirmPasswordReset(token, password)
      tokenStore.clear()
      setDone(true)
    } catch (cause) {
      setError(errorMessage(cause))
      setPending(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="content">
        <div className="screen-intro">
          <p className="small-label">비밀번호 재설정</p>
          <h2>
            새 비밀번호를
            <br />
            정해 주세요
          </h2>
        </div>

        <label htmlFor="password" className="field-label">
          새 비밀번호 <span className="field-hint">8자 이상</span>
        </label>
        <input
          id="password"
          className="text-input"
          type="password"
          autoComplete="new-password"
          value={password}
          maxLength={64}
          onChange={(event) => setPassword(event.target.value)}
        />

        <label htmlFor="password-again" className="field-label field-gap">
          새 비밀번호 확인
        </label>
        <input
          id="password-again"
          className="text-input"
          type="password"
          autoComplete="new-password"
          value={passwordAgain}
          maxLength={64}
          aria-describedby="password-again-status"
          onChange={(event) => setPasswordAgain(event.target.value)}
        />
        <p id="password-again-status" className="input-status" aria-live="polite">
          {mismatch && '비밀번호가 서로 달라요.'}
        </p>
        {error && (
          <p className="notice">
            {error} <Link to="/password-reset/request">다시 요청하기</Link>
          </p>
        )}
      </div>
      <div className="actions">
        <button
          type="submit"
          className="primary"
          disabled={pending || password.length < 8 || password !== passwordAgain}
        >
          비밀번호 바꾸기 <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  )
}

export default PasswordResetPage
