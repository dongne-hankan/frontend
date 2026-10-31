import { createBrowserRouter } from 'react-router-dom'
import CourseDetailPage from '../pages/CourseDetailPage'
import HomePage from '../pages/HomePage'
import KakaoCallbackPage from '../pages/KakaoCallbackPage'
import LoginPage from '../pages/LoginPage'
import MyNeighborhoodPage from '../pages/MyNeighborhoodPage'
import NotFoundPage from '../pages/NotFoundPage'
import PlaceDetailPage from '../pages/PlaceDetailPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/courses/:courseId', element: <CourseDetailPage /> },
  { path: '/places/:placeId', element: <PlaceDetailPage /> },
  { path: '/my', element: <MyNeighborhoodPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/oauth/kakao', element: <KakaoCallbackPage /> },
  { path: '*', element: <NotFoundPage /> },
])
