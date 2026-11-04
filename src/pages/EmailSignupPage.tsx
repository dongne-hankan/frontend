import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { checkEmailAvailability, signupWithEmail } from '../features/auth/api/authApi'
import { safeNext } from '../features/auth/api/loginAttempt'
import { errorMessage } from '../shared/api/client'
import { tokenStore } from '../shared/auth/tokenStore'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface EmailCheck {
  email: string
  available: boolean | null
}

function EmailSignupPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [email, setEmail] = useState('')
  const [emailCheck, setEmailCheck] = useState<EmailCheck>()
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  const trimmedEmail = email.trim()
  const emailValid = EMAIL_PATTERN.test(trimmedEmail)
  const available = emailValid && emailCheck?.email === trimmedEmail ? emailCheck.available : null
  const emailStatus = available === null ? 'idle' : available ? 'available' : 'taken'

  // 가입 버튼을 누르기 전에 중복을 알려 주도록 입력이 멈추면 확인한다.
  useEffect(() => {
    if (!emailValid) {
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      checkEmailAvailability(trimmedEmail)
        .then((result) => !cancelled && setEmailCheck({ email: trimmedEmail, available: result.available }))
        .catch(() => !cancelled && setEmailCheck({ email: trimmedEmail, available: null }))
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [trimmedEmail, emailValid])

  const canSubmit =
    emailValid &&
    emailStatus !== 'taken' &&
    password.length >= 8 &&
    nickname.trim().length >= 2 &&
    agreed &&
    !pending

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) {
      return
    }
    setPending(true)
    setError(undefined)
    try {
      const tokens = await signupWithEmail(trimmedEmail, password, nickname.trim())
      tokenStore.save(tokens.accessToken, tokens.refreshToken)
      navigate(next, { replace: true })
    } catch (cause) {
      setError(errorMessage(cause))
      setPending(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="content">
        <div className="screen-intro">
          <p className="small-label">처음 오셨네요</p>
          <h2>
            동네 한 칸을
            <br />
            시작해 볼까요?
          </h2>
          <p>가입하면 담은 코스와 기록을 저장할 수 있어요.</p>
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
          aria-describedby="email-status"
          onChange={(event) => setEmail(event.target.value)}
        />
        <p id="email-status" className="input-status" aria-live="polite">
          {emailStatus === 'taken' && (
            <>
              이미 가입된 이메일이에요. <Link to={`/login?next=${encodeURIComponent(next)}`}>로그인하기</Link>
            </>
          )}
          {emailStatus === 'available' && '사용할 수 있는 이메일이에요.'}
        </p>

        <label htmlFor="password" className="field-label">
          비밀번호 <span className="field-hint">8자 이상</span>
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

        <label htmlFor="nickname" className="field-label field-gap">
          닉네임 <span className="field-hint">2~12자</span>
        </label>
        <input
          id="nickname"
          className="text-input"
          value={nickname}
          maxLength={12}
          onChange={(event) => setNickname(event.target.value)}
        />

        <div className="consent">
          <h3 className="field-label">개인정보 수집·이용 동의 (필수)</h3>
          <p>
            수집 항목: 이메일, 비밀번호(암호화해 저장), 닉네임
            <br />
            이용 목적: 로그인, 담은 코스와 기록 저장
            <br />
            보관 기간: 회원 탈퇴 시까지
          </p>
          <label className="check-row">
            <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
            위 내용에 동의해요
          </label>
        </div>
        {error && <p className="notice">{error}</p>}
      </div>
      <div className="actions">
        <button type="submit" className="primary" disabled={!canSubmit}>
          가입하기 <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  )
}

export default EmailSignupPage
