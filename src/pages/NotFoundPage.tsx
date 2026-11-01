import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="content">
      <p className="state">페이지를 찾을 수 없어요.</p>
      <Link className="primary" to="/">
        동네 찾기로 돌아가기 <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}

export default NotFoundPage
