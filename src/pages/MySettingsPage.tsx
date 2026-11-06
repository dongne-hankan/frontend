import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useChangeNickname, useLogout, useMyInfo, useWithdraw } from '../features/auth/api/authApi'
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
