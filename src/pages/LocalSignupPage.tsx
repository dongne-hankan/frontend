import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { checkLoginIdAvailability, signupLocal } from '../features/auth/api/authApi'
import { safeNext } from '../features/auth/api/loginAttempt'
import { errorMessage } from '../shared/api/client'
import { tokenStore } from '../shared/auth/tokenStore'

const LOGIN_ID_PATTERN = /^[A-Za-z0-9]{4,20}$/

interface LoginIdCheck {
  loginId: string
  available: boolean | null
}

function LocalSignupPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [loginId, setLoginId] = useState('')
  const [loginIdCheck, setLoginIdCheck] = useState<LoginIdCheck>()
  const [password, setPassword] = useState('')
  const [passwordAgain, setPasswordAgain] = useState('')
  const [nickname, setNickname] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  const trimmedLoginId = loginId.trim()
  const loginIdValid = LOGIN_ID_PATTERN.test(trimmedLoginId)
  const available = loginIdValid && loginIdCheck?.loginId === trimmedLoginId ? loginIdCheck.available : null
  const passwordMismatch = passwordAgain.length > 0 && password !== passwordAgain

  // 가입 버튼을 누르기 전에 중복을 알려 주도록 입력이 멈추면 확인한다.
  useEffect(() => {
    if (!loginIdValid) {
      return
    }
    let cancelled = false
    const timer = setTimeout(() => {
      checkLoginIdAvailability(trimmedLoginId)
        .then((result) => !cancelled && setLoginIdCheck({ loginId: trimmedLoginId, available: result.available }))
        .catch(() => !cancelled && setLoginIdCheck({ loginId: trimmedLoginId, available: null }))
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [trimmedLoginId, loginIdValid])

  const canSubmit =
    loginIdValid &&
    available !== false &&
    password.length >= 8 &&
    password === passwordAgain &&
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
      const tokens = await signupLocal(trimmedLoginId, password, nickname.trim())
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

        <label htmlFor="login-id" className="field-label">
          아이디 <span className="field-hint">영문·숫자 4~20자</span>
        </label>
        <input
          id="login-id"
          className="text-input"
          autoComplete="username"
          autoCapitalize="none"
          value={loginId}
          maxLength={20}
          aria-describedby="login-id-status"
          onChange={(event) => setLoginId(event.target.value)}
        />
        <p id="login-id-status" className="input-status" aria-live="polite">
          {trimmedLoginId.length > 0 && !loginIdValid && '영문과 숫자로 4~20자 입력해 주세요.'}
          {available === false && (
            <>
              이미 사용 중인 아이디예요. <Link to={`/login?next=${encodeURIComponent(next)}`}>로그인하기</Link>
            </>
          )}
          {available === true && '사용할 수 있는 아이디예요.'}
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

        <label htmlFor="password-again" className="field-label field-gap">
          비밀번호 확인
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
          {passwordMismatch && '비밀번호가 서로 달라요.'}
        </p>

        <label htmlFor="nickname" className="field-label">
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
            수집 항목: 아이디, 비밀번호(암호화해 저장), 닉네임
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
        <p className="field-hint-block">이메일을 받지 않아서 비밀번호를 잊으면 찾을 수 없어요. 꼭 기억해 주세요.</p>
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="actions">
        <button type="submit" className="primary" disabled={!canSubmit}>
          가입하기 <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  )
}

export default LocalSignupPage
