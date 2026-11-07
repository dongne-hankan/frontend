import { useMutation } from '@tanstack/react-query'
import { postData } from '../../../shared/api/client'
import type { Duration } from '../../find/api/findApi'

export interface Point {
  lat: number
  lng: number
}

// 대구시청 주변. 위치를 고르기 전 지도와 검색의 기준점이다.
export const DEFAULT_CENTER: Point = { lat: 35.8714, lng: 128.6014 }

export interface NearbyRequest extends Point {
  duration: Duration
  mood?: string
  tagId?: number
}

export interface NearbyStop {
  order: number
  name: string
  address: string
  lat: number
  lng: number
  stayMinutes: number
  moveMinutesToNext: number | null
  reason: string
  kakaoPlaceId: string
  kakaoPlaceUrl: string | null
}

export interface NearbyCourse {
  courseId: number | null
  name: string
  intro: string
  reason: string
  durationMinutes: number
  stops: NearbyStop[]
}

export interface NearbyRecommendation {
  center: Point
  courses: NearbyCourse[]
  aiGenerated: boolean
  message: string | null
}

// 백엔드 없이 화면만 볼 때는 .env에 VITE_USE_NEARBY_MOCK=true를 넣어 가짜 응답을 쓴다.
const useMock = import.meta.env.VITE_USE_NEARBY_MOCK === 'true'

function mockStop(center: Point, order: number, latOffset: number, lngOffset: number): NearbyStop {
  return {
    order,
    name: `예시 장소 ${order}`,
    address: '가짜 응답이라 주소가 없어요',
    lat: center.lat + latOffset,
    lng: center.lng + lngOffset,
    stayMinutes: 15,
    moveMinutesToNext: order === 1 ? 5 : null,
    reason: '화면 개발용 가짜 응답입니다.',
    kakaoPlaceId: `mock-${order}`,
    kakaoPlaceUrl: null,
  }
}

function mockRecommendation(request: NearbyRequest): Promise<NearbyRecommendation> {
  const center = { lat: request.lat, lng: request.lng }
  const course = (name: string, offset: number): NearbyCourse => ({
    courseId: null,
    name,
    intro: '백엔드 API가 연결되기 전까지 보여주는 예시 코스예요.',
    reason: request.mood ? `"${request.mood}"에 맞춰 고른 예시예요.` : '고른 위치 주변의 예시예요.',
    durationMinutes: request.duration === 'MIN_30' ? 30 : 60,
    stops: [mockStop(center, 1, offset, offset), mockStop(center, 2, -offset, offset * 2)],
  })
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          center,
          courses: [course('예시 코스 A', 0.002), course('예시 코스 B', 0.004)],
          aiGenerated: true,
          message: null,
        }),
      700,
    ),
  )
}

export function useNearbyRecommendation() {
  return useMutation({
    mutationFn: (request: NearbyRequest) =>
      useMock ? mockRecommendation(request) : postData<NearbyRecommendation>('/api/find/nearby', request),
  })
}
