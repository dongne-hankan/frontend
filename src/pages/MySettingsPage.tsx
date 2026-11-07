import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  useChangeNickname,
  useChangePassword,
  useLogout,
  useMyInfo,
  useWithdraw,
} from '../features/auth/api/authApi'
import { errorMessage } from '../shared/api/client'
import { tokenStore } from '../shared/auth/tokenStore'

function NicknameForm({ current }: { current: string }) {
  const [nickname, setNickname] = useState(current)
  const changeNickname = useChangeNickname()
  const unchanged = nickname.trim() === current
  const canSubmit = !unchanged && nickname.trim().length >= 2 && !changeNickname.isPending

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (canSubmit) {
      changeNickname.mutate(nickname.trim())
    }
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="my-nickname" className="field-label">
        닉네임
      </label>
      <input
        id="my-nickname"
        className="text-input"
        value={nickname}
        maxLength={12}
        onChange={(event) => setNickname(event.target.value)}
      />
      <button type="submit" className="secondary spaced" disabled={!canSubmit}>
        닉네임 바꾸기
      </button>
      {changeNickname.isSuccess && unchanged && <p className="notice">닉네임을 바꿨어요.</p>}
      {changeNickname.error && <p className="notice">{errorMessage(changeNickname.error)}</p>}
    </form>
  )
}

// 비밀번호를 바꾸면 서버가 모든 로그인을 끊으므로 다시 로그인하게 한다.
function PasswordForm() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const changePassword = useChangePassword()
  const canSubmit = currentPassword.length > 0 && newPassword.length >= 8 && !changePassword.isPending

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) {
      return
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          tokenStore.clear()
          navigate('/login', {
            replace: true,
            state: { notice: '비밀번호를 바꿨어요. 새 비밀번호로 다시 로그인해 주세요.' },
          })
        },
      },
    )
  }

  return (
    <form className="section" onSubmit={submit}>
      <label htmlFor="current-password" className="field-label">
        현재 비밀번호
      </label>
      <input
        id="current-password"
        className="text-input"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
      />
      <label htmlFor="new-password" className="field-label field-gap">
        새 비밀번호 <span className="field-hint">8자 이상</span>
      </label>
      <input
        id="new-password"
        className="text-input"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        maxLength={64}
        onChange={(event) => setNewPassword(event.target.value)}
      />
      <button type="submit" className="secondary spaced" disabled={!canSubmit}>
        비밀번호 바꾸기
      </button>
      {changePassword.error && <p className="notice">{errorMessage(changePassword.error)}</p>}
    </form>
  )
}

function MySettingsPage() {
  const { data: me, isPending, error } = useMyInfo()
  const logout = useLogout()
  const withdraw = useWithdraw()

  if (!tokenStore.isLoggedIn()) {
    return <Navigate to="/login?next=/my/settings" replace />
  }

  const confirmWithdraw = () => {
    if (window.confirm('탈퇴하면 담은 코스와 기록이 모두 지워지고 되돌릴 수 없어요. 탈퇴할까요?')) {
      withdraw.mutate()
    }
  }

  return (
    <>
      <div className="brand-row">
        <Link to="/my" className="back">
          ← 내 한 칸
        </Link>
        <span className="small-label">내 정보</span>
      </div>
      <div className="content">
        {isPending && <p className="state">내 정보를 불러오고 있어요.</p>}
        {error && <p className="state">{errorMessage(error)}</p>}
        {me && (
          <>
            <NicknameForm current={me.nickname} />
            {me.loginId && <PasswordForm />}
            <div className="feeling-box">
              <button type="button" className="secondary" disabled={logout.isPending} onClick={() => logout.mutate()}>
                로그아웃
              </button>
              <button type="button" className="quiet" disabled={withdraw.isPending} onClick={confirmWithdraw}>
                회원 탈퇴
              </button>
              {withdraw.error && <p className="notice">{errorMessage(withdraw.error)}</p>}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default MySettingsPage
