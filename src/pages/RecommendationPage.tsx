import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRecommendations, type Condition } from '../features/find/api/findApi'
import CourseCard from '../features/find/components/CourseCard'
import { errorMessage } from '../shared/api/client'

function parseCondition(params: URLSearchParams): Condition | null {
  const regionId = Number(params.get('regionId'))
  const tagId = Number(params.get('tagId'))
  const duration = params.get('duration')
  if (!Number.isInteger(regionId) || regionId <= 0 || !Number.isInteger(tagId) || tagId <= 0
    || (duration !== 'MIN_30' && duration !== 'HOUR_1')) {
    return null
  }
  return { regionId, tagId, duration }
}

function RecommendationPage() {
  const [params] = useSearchParams()
  const condition = useMemo(() => parseCondition(params), [params])
  const conditionKey = JSON.stringify(condition)
  const [history, setHistory] = useState<{ conditionKey: string; ids: number[] }>({ conditionKey, ids: [] })
  const seenCourseIds = history.conditionKey === conditionKey ? history.ids : []
  const { data: aiData, isPending, isFetching, error, refetch } = useRecommendations(condition, seenCourseIds)
  const data = aiData?.recommendation
  const reasons = new Map(aiData?.aiGenerated ? aiData.reasons.map((item) => [item.courseId, item.reason]) : [])
  const resetSeen = () => setHistory({ conditionKey, ids: [] })

  const showNext = () => {
    if (data) {
      setHistory({ conditionKey, ids: [...seenCourseIds, ...data.courses.map((course) => course.courseId)] })
    }
  }

  const allSeen = data !== undefined && data.courses.length === 0 && seenCourseIds.length > 0

  return (
    <>
      <div className="brand-row">
        <Link to="/" className="back">
          ← 조건 바꾸기
        </Link>
        <span className="small-label">오늘의 동네</span>
      </div>
      <div className="content">
        <div className="screen-intro">
          <p className="small-label">주민의 일상으로 잇는 짧은 외출</p>
          <h2>
            오늘은 이런 코스를
            <br />
            골라봤어요.
          </h2>
          <p>마음이 가는 코스를 눌러 주민의 이야기를 만나보세요.</p>
        </div>

        {condition === null && <p className="state">지역, 경험, 시간을 먼저 골라 주세요.</p>}
        {condition !== null && isPending && <p className="state">코스를 찾고 있어요.</p>}
        {error && <p className="state">{errorMessage(error)}</p>}

        {data?.fallback.message && <p className="notice">{data.fallback.message}</p>}
        {data?.personalization.message && <p className="notice">{data.personalization.message}</p>}
        {data?.courses.map((course) => (
          <CourseCard key={course.courseId} course={course} aiReason={reasons.get(course.courseId)} />
        ))}

        {data && data.courses.length > 0 && reasons.size < data.courses.length && (
          <div className="notice">
            <p>조건에 맞는 코스를 먼저 보여드렸어요. AI 설명은 준비되지 않았어요.</p>
            <button type="button" className="secondary" disabled={isFetching} onClick={() => void refetch()}>
              {isFetching ? '추천 이유 확인 중…' : '추천 이유 다시 확인'}
            </button>
          </div>
        )}

        {allSeen && (
          <>
            <p className="state">이 조건의 코스를 모두 봤어요.</p>
            <button type="button" className="secondary" onClick={resetSeen}>
              처음 결과로 돌아가기
            </button>
          </>
        )}
        {data?.hasMore && (
          <button type="button" className="secondary" disabled={isFetching} onClick={showNext}>
            다른 코스 보기
          </button>
        )}
      </div>
    </>
  )
}

export default RecommendationPage
