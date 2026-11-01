import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchAuthorizeUrl } from '../features/auth/api/authApi'
import { safeNext, saveLoginAttempt } from '../features/auth/api/loginAttempt'
import { errorMessage } from '../shared/api/client'

function LoginPage() {
  const [params] = useSearchParams()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  const startLogin = async () => {
    setPending(true)
    setError(undefined)
    try {
      const { authorizeUrl, state } = await fetchAuthorizeUrl()
      saveLoginAttempt({ state, next: safeNext(params.get('next')) })
      window.location.assign(authorizeUrl)
    } catch (cause) {
      setError(errorMessage(cause))
      setPending(false)
    }
  }

  return (
    <>
      <div className="content">
        <div className="screen-intro">
          <p className="small-label">동네 한 칸</p>
          <h2>
            나의 동네를
            <br />한 칸씩 채워볼까요?
          </h2>
          <p>담은 코스와 다녀온 기록은 로그인하면 이어서 볼 수 있어요.</p>
        </div>
        {error && <p className="notice">{error}</p>}
      </div>
      <div className="actions">
        <button type="button" className="kakao" disabled={pending} onClick={startLogin}>
          카카오로 시작하기
        </button>
      </div>
    </>
  )
}

export default LoginPage
