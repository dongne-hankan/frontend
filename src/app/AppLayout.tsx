import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { tokenStore } from '../shared/auth/tokenStore'

function AppLayout() {
  // 화면을 옮길 때마다 다시 그려서 로그인·로그아웃 직후에도 탭 표시가 맞게 한다.
  useLocation()
  const loggedIn = tokenStore.isLoggedIn()

  return (
    <div className="app">
      <main className="app-main">
        <Outlet />
      </main>
      {loggedIn && (
        <nav className="bottom-nav" aria-label="주요 메뉴">
          <NavLink to="/" end>
            <span className="nav-mark" aria-hidden="true">
              ◎
            </span>
            주변 산책
          </NavLink>
          <NavLink to="/my">
            <span className="nav-mark" aria-hidden="true">
              ▱
            </span>
            내 한 칸
          </NavLink>
        </nav>
      )}
    </div>
  )
}

export default AppLayout
