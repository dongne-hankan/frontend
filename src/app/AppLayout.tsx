import { NavLink, Outlet } from 'react-router-dom'

function AppLayout() {
  return (
    <div className="app">
      <main className="app-main">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="주요 메뉴">
        <NavLink to="/" end>
          <span className="nav-mark" aria-hidden="true">
            ◎
          </span>
          주변 산책
        </NavLink>
        <NavLink to="/find">
          <span className="nav-mark" aria-hidden="true">
            ⌂
          </span>
          동네 찾기
        </NavLink>
        <NavLink to="/my">
          <span className="nav-mark" aria-hidden="true">
            ▱
          </span>
          내 한 칸
        </NavLink>
      </nav>
    </div>
  )
}

export default AppLayout
