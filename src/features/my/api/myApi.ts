import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { apiClient, getData, patchData, postData } from '../../../shared/api/client'
import type { PageResponse } from '../../../shared/api/types'
import { tokenStore } from '../../../shared/auth/tokenStore'
import type { CourseSummary } from '../../find/api/findApi'

export type Feeling = 'WANT_AGAIN' | 'GOOD' | 'NOT_FOR_ME'

export const FEELINGS: { value: Feeling; label: string }[] = [
  { value: 'WANT_AGAIN', label: '또 오고 싶어요' },
  { value: 'GOOD', label: '좋았어요' },
  { value: 'NOT_FOR_ME', label: '나랑은 안 맞았어요' },
]

export function feelingLabel(feeling: Feeling) {
  return FEELINGS.find((item) => item.value === feeling)?.label ?? ''
}

export interface SavedCourseItem {
  savedAt: string
  visited: boolean
  course: CourseSummary
}

export interface VisitRecord {
  recordId: number
  course: { courseId: number; name: string; thumbnailUrl: string | null; visible: boolean }
  feeling: Feeling
  memo: string | null
  visitedOn: string
  photoUrl: string | null
  createdAt: string
}

export interface RecordValues {
  feeling: Feeling
  memo: string
  visitedOn: string
}

export interface RecordCreated {
  record: VisitRecord
  neighborhood: {
    filledCellCount: number
    totalCellCount: number
    newlyFilled: boolean
    visitedRegionCount: number
    newRegion: boolean
  }
}

export interface Neighborhood {
  grid: {
    regions: { regionId: number; name: string }[]
    tags: { tagId: number; name: string }[]
    cells: { regionId: number; tagId: number; filled: boolean; recordCount: number; lastVisitedOn: string | null }[]
    filledCellCount: number
    totalCellCount: number
    visitedRegionCount: number
  }
  summary: {
    recordCount: number
    savedCourseCount: number
    feelingCounts: Record<Feeling, number>
    topTag: { tagId: number; name: string } | null
    topTagMessage: string | null
  }
}

const LIST_SIZE = { size: 50 }

function refreshMyData(queryClient: QueryClient) {
  for (const queryKey of [['my'], ['courses'], ['users', 'me']]) {
    queryClient.invalidateQueries({ queryKey })
  }
}

function useMyMutation<Variables, Result>(mutationFn: (variables: Variables) => Promise<Result>) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn, onSuccess: () => refreshMyData(queryClient) })
}

export function useNeighborhood() {
  return useQuery({
    queryKey: ['my', 'neighborhood'],
    queryFn: () => getData<Neighborhood>('/api/my/neighborhood'),
    enabled: tokenStore.isLoggedIn(),
  })
}

export function useSavedCourses() {
  return useQuery({
    queryKey: ['my', 'saved-courses'],
    queryFn: () => getData<PageResponse<SavedCourseItem>>('/api/my/saved-courses', LIST_SIZE),
    enabled: tokenStore.isLoggedIn(),
  })
}

export function useRecords() {
  return useQuery({
    queryKey: ['my', 'records'],
    queryFn: () => getData<PageResponse<VisitRecord>>('/api/my/records', LIST_SIZE),
    enabled: tokenStore.isLoggedIn(),
  })
}

export function useSaveCourse() {
  return useMyMutation((courseId: number) => postData('/api/my/saved-courses', { courseId }))
}

export function useUnsaveCourse() {
  return useMyMutation((courseId: number) => apiClient.delete(`/api/my/saved-courses/${courseId}`))
}

export function useCreateRecord() {
  return useMyMutation((values: RecordValues & { courseId: number }) =>
    postData<RecordCreated>('/api/my/records', values),
  )
}

export interface WalkCourse {
  name: string
  intro: string
  durationMinutes: number
  stops: { order: number; kakaoPlaceId: string; kakaoPlaceUrl: string | null; stayMinutes: number; moveMinutesToNext: number | null }[]
}

export function useRecordWalk() {
  return useMyMutation(
    (body: RecordValues & { course: WalkCourse & { tagId: number; center: { lat: number; lng: number } } }) =>
      postData<RecordCreated>('/api/my/walks', body),
  )
}

export function useUpdateRecord() {
  return useMyMutation(({ recordId, ...values }: RecordValues & { recordId: number }) =>
    patchData<VisitRecord>(`/api/my/records/${recordId}`, values),
  )
}

export function useDeleteRecord() {
  return useMyMutation((recordId: number) => apiClient.delete(`/api/my/records/${recordId}`))
}
