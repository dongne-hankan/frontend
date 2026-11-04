import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../features/auth/api/authApi'
import { errorMessage } from '../shared/api/client'

function PasswordResetRequestPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(undefined)
    try {
      await requestPasswordReset(email.trim())
      setSent(true)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setPending(false)
    }
  }

  if (sent) {
    return (
      <div className="content">
        <div className="screen-intro">
          <p className="small-label">비밀번호 찾기</p>
          <h2>메일함을 확인해 주세요</h2>
          <p>
            {email.trim()}(으)로 가입한 계정이 있으면 재설정 링크를 보냈어요. 링크는 30분 동안 한 번만 쓸 수 있어요.
            카카오로 가입했다면 카카오로 로그인해 주세요.
          </p>
        </div>
        <Link className="primary" to="/login">
          로그인하기 <span aria-hidden="true">→</span>
        </Link>
      </div>
    )
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="content">
        <div className="screen-intro">
          <p className="small-label">비밀번호 찾기</p>
          <h2>
            가입한 이메일을
            <br />
            알려 주세요
          </h2>
          <p>새 비밀번호를 설정할 수 있는 링크를 보내 드려요.</p>
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
        {error && <p className="notice">{error}</p>}
      </div>
      <div className="actions">
        <button type="submit" className="primary" disabled={pending || !email.trim()}>
          재설정 링크 받기 <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  )
}

export default PasswordResetRequestPage
