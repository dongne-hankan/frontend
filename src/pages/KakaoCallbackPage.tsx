import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { loginWithKakao } from '../features/auth/api/authApi'
import { takeLoginAttempt } from '../features/auth/api/loginAttempt'
import { errorMessage } from '../shared/api/client'
import { tokenStore } from '../shared/auth/tokenStore'

function KakaoCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState<string>()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) {
      return
    }
    started.current = true

    const completeLogin = async () => {
      const attempt = takeLoginAttempt()
      const code = params.get('code')
      const state = params.get('state')
      if (!code || !state || attempt?.state !== state) {
        throw new Error('Login attempt mismatch')
      }

      const result = await loginWithKakao(code, state)
      if (result.signupRequired) {
        navigate('/signup', { replace: true, state: { ...result, next: attempt.next } })
      } else {
        tokenStore.save(result.accessToken, result.refreshToken)
        navigate(attempt.next, { replace: true })
      }
    }

    completeLogin().catch((cause) => setError(errorMessage(cause)))
  }, [navigate, params])

  return (
    <div className="content">
      {error ? (
        <>
          <p className="state">{error}</p>
          <Link className="primary" to="/login">
            다시 로그인하기 <span aria-hidden="true">→</span>
          </Link>
        </>
      ) : (
        <p className="state">로그인하고 있어요.</p>
      )}
    </div>
  )
}

export default KakaoCallbackPage
