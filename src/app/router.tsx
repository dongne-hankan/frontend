import { createBrowserRouter } from 'react-router-dom'
import CourseDetailPage from '../pages/CourseDetailPage'
import HomePage from '../pages/HomePage'
import EditRecordPage from '../pages/EditRecordPage'
import KakaoCallbackPage from '../pages/KakaoCallbackPage'
import LoginPage from '../pages/LoginPage'
import MyNeighborhoodPage from '../pages/MyNeighborhoodPage'
import MySettingsPage from '../pages/MySettingsPage'
import NotFoundPage from '../pages/NotFoundPage'
import PlaceDetailPage from '../pages/PlaceDetailPage'
import RecommendationPage from '../pages/RecommendationPage'
import RecordPage from '../pages/RecordPage'
import SignupPage from '../pages/SignupPage'
import AppLayout from './AppLayout'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/recommendations', element: <RecommendationPage /> },
      { path: '/courses/:courseId', element: <CourseDetailPage /> },
      { path: '/courses/:courseId/record', element: <RecordPage /> },
      { path: '/places/:placeId', element: <PlaceDetailPage /> },
      { path: '/my', element: <MyNeighborhoodPage /> },
      { path: '/my/settings', element: <MySettingsPage /> },
      { path: '/my/records/:recordId/edit', element: <EditRecordPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/oauth/kakao', element: <KakaoCallbackPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
