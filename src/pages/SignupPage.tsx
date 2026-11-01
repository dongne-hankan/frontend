import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signup } from '../features/auth/api/authApi'
import { errorMessage } from '../shared/api/client'
import { tokenStore } from '../shared/auth/tokenStore'

interface SignupState {
  signupToken: string
  kakaoNickname: string | null
  next: string
}

function SignupPage() {
  const navigate = useNavigate()
  const signupState = useLocation().state as SignupState | null
  const [nickname, setNickname] = useState((signupState?.kakaoNickname ?? '').slice(0, 12))
  const [agreed, setAgreed] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  if (!signupState) {
    return (
      <div className="content">
        <p className="state">카카오 로그인부터 다시 진행해 주세요.</p>
        <Link className="primary" to="/login">
          로그인하기 <span aria-hidden="true">→</span>
        </Link>
      </div>
    )
  }

  const submit = async () => {
    setPending(true)
    setError(undefined)
    try {
      const tokens = await signup(signupState.signupToken, nickname.trim())
      tokenStore.save(tokens.accessToken, tokens.refreshToken)
      navigate(signupState.next, { replace: true })
    } catch (cause) {
      setError(errorMessage(cause))
      setPending(false)
    }
  }

  return (
    <>
      <div className="content">
        <div className="screen-intro">
          <p className="small-label">처음 오셨네요</p>
          <h2>
            동네 한 칸을
            <br />
            시작해 볼까요?
          </h2>
          <p>동의하면 담은 코스와 기록을 저장할 수 있어요.</p>
        </div>

        <label htmlFor="nickname" className="field-label">
          닉네임
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
            수집 항목: 카카오 회원번호, 닉네임
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
        <button
          type="button"
          className="primary"
          disabled={!agreed || nickname.trim().length < 2 || pending}
          onClick={submit}
        >
          시작하기 <span aria-hidden="true">→</span>
        </button>
      </div>
    </>
  )
}

export default SignupPage
