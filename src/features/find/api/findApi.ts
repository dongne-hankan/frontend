import { useQuery } from '@tanstack/react-query'
import { getData } from '../../../shared/api/client'

export type Duration = 'MIN_30' | 'HOUR_1'

export interface FindOptions {
  regions: { regionId: number; name: string; province: string }[]
  tags: { tagId: number; name: string; phrase: string; icon: string }[]
  durations: { code: Duration; label: string; minutes: number }[]
}

export interface Condition {
  regionId: number
  tagId: number
  duration: Duration
}

export interface CourseSummary {
  courseId: number
  name: string
  intro: string
  thumbnailUrl: string | null
  region: { regionId: number; name: string }
  tags: { tagId: number; name: string }[]
  durationMinutes: number
  stopCount: number
  highlightQuote: string | null
  visible?: boolean
}

export interface Recommendation {
  condition: Condition
  courses: CourseSummary[]
  hasMore: boolean
  fallback: {
    type: 'NONE' | 'LONGER_DURATION' | 'OTHER_TAG' | 'EMPTY'
    message: string | null
    appliedCondition: Condition | null
  }
  personalization: { applied: boolean; message: string | null }
}

export interface AiRecommendation {
  recommendation: Recommendation
  reasons: { courseId: number; reason: string }[]
  aiGenerated: boolean
}

export function useFindOptions() {
  return useQuery({
    queryKey: ['find', 'options'],
    queryFn: () => getData<FindOptions>('/api/find/options'),
    staleTime: Infinity,
  })
}

export function useRecommendations(condition: Condition | null, seenCourseIds: number[]) {
  return useQuery({
    queryKey: ['find', 'ai-recommendations', condition, seenCourseIds],
    queryFn: () =>
      getData<AiRecommendation>('/api/find/ai-recommendations', {
        ...condition,
        excludeCourseIds: seenCourseIds.length > 0 ? seenCourseIds.join(',') : undefined,
      }),
    enabled: condition !== null,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
  })
}
