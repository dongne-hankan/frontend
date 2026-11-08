import { createBrowserRouter, redirect, type LoaderFunctionArgs } from 'react-router-dom'
import CourseDetailPage from '../pages/CourseDetailPage'
import EditRecordPage from '../pages/EditRecordPage'
import KakaoCallbackPage from '../pages/KakaoCallbackPage'
import LocalSignupPage from '../pages/LocalSignupPage'
import MapHomePage from '../pages/MapHomePage'
import LoginPage from '../pages/LoginPage'
import MyNeighborhoodPage from '../pages/MyNeighborhoodPage'
import MySettingsPage from '../pages/MySettingsPage'
import NotFoundPage from '../pages/NotFoundPage'
import PlaceDetailPage from '../pages/PlaceDetailPage'
import RecordPage from '../pages/RecordPage'
import SignupPage from '../pages/SignupPage'
import WalkRecordPage from '../pages/WalkRecordPage'
import { tokenStore } from '../shared/auth/tokenStore'
import AppLayout from './AppLayout'

// 로그인하지 않으면 로그인 화면으로 보내고, 로그인한 뒤 원래 가려던 화면으로 돌아오게 한다.
function requireLogin({ request }: LoaderFunctionArgs) {
  if (tokenStore.isLoggedIn()) {
    return null
  }
  const { pathname, search } = new URL(request.url)
  return redirect(`/login?next=${encodeURIComponent(pathname + search)}`)
}

function guestOnly() {
  return tokenStore.isLoggedIn() ? redirect('/') : null
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        loader: requireLogin,
        element: <MapHomePage />,
      },
      { path: '/map', loader: () => redirect('/') },
      { path: '/find', loader: () => redirect('/') },
      { path: '/walks/record', loader: requireLogin, element: <WalkRecordPage /> },
      { path: '/courses/:courseId', element: <CourseDetailPage /> },
      { path: '/courses/:courseId/record', loader: requireLogin, element: <RecordPage /> },
      { path: '/places/:placeId', element: <PlaceDetailPage /> },
      { path: '/my', loader: requireLogin, element: <MyNeighborhoodPage /> },
      { path: '/my/settings', loader: requireLogin, element: <MySettingsPage /> },
      { path: '/my/records/:recordId/edit', loader: requireLogin, element: <EditRecordPage /> },
      { path: '/login', loader: guestOnly, element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/signup/local', loader: guestOnly, element: <LocalSignupPage /> },
      { path: '/oauth/kakao', element: <KakaoCallbackPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
