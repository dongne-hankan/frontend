import { useNavigate } from 'react-router-dom'

// 링크로 바로 들어오거나 로그인 후 돌아온 화면은 앱 안의 이전 기록이 없어서 뒤로 가면 앱 밖으로 나간다.
export function useGoBack(fallback: string) {
  const navigate = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) {
      navigate(-1)
    } else {
      navigate(fallback, { replace: true })
    }
  }
}
