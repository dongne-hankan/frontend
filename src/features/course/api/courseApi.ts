import { useQuery } from '@tanstack/react-query'
import { getData } from '../../../shared/api/client'
import type { Feeling } from '../../my/api/myApi'

export interface StoryHighlight {
  storyId: number
  residentIntro: string
  reason: string
  howToEnjoy: string
}

export interface CourseStop {
  order: number
  place: {
    placeId: number
    name: string
    address: string
    lat: number
    lng: number
    thumbnailUrl: string | null
    timeSensitive: boolean
    sourceUrl: string | null
  }
  stayMinutes: number
  moveMinutesToNext: number | null
  highlightQuote: string | null
  highlightStory: StoryHighlight | null
}

export interface CourseDetail {
  courseId: number
  name: string
  intro: string
  thumbnailUrl: string | null
  region: { regionId: number; name: string; province: string }
  tags: { tagId: number; name: string; phrase: string; icon: string }[]
  durationMinutes: number
  transport: string
  stops: CourseStop[]
  me: {
    saved: boolean
    records: { recordId: number; feeling: Feeling; visitedOn: string }[]
  } | null
}

export interface PlaceDetail {
  placeId: number
  name: string
  address: string
  lat: number
  lng: number
  photoUrls: string[]
  checkedOn: string
  timeSensitive: boolean
  sourceUrl: string | null
  stories: {
    storyId: number
    residentIntro: string
    residentName: string | null
    residentPhotoUrl: string | null
    reason: string
    howToEnjoy: string
  }[]
}

export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ['courses', courseId],
    queryFn: () => getData<CourseDetail>(`/api/courses/${courseId}`),
    enabled: courseId !== undefined,
  })
}

export function usePlace(placeId: string | undefined) {
  return useQuery({
    queryKey: ['places', placeId],
    queryFn: () => getData<PlaceDetail>(`/api/places/${placeId}`),
    enabled: placeId !== undefined,
  })
}

export function directionsUrl(place: { name: string; lat: number; lng: number }) {
  return `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`
}
