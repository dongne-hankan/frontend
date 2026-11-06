import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useRecommendations, type Condition, type Duration } from '../features/find/api/findApi'
import CourseCard from '../features/find/components/CourseCard'
import { errorMessage } from '../shared/api/client'

function parseCondition(params: URLSearchParams): Condition | null {
  const regionId = Number(params.get('regionId'))
  const tagId = Number(params.get('tagId'))
  const duration = params.get('duration')
  if (!regionId || !tagId || !duration) {
    return null
  }
  return { regionId, tagId, duration: duration as Duration }
}

function RecommendationPage() {
  const [params] = useSearchParams()
  const condition = useMemo(() => parseCondition(params), [params])
  const [seenCourseIds, setSeenCourseIds] = useState<number[]>([])
  const { data, isPending, error } = useRecommendations(condition, seenCourseIds)

  const showNext = () => {
    if (data) {
      setSeenCourseIds([...seenCourseIds, ...data.courses.map((course) => course.courseId)])
    }
  }

  const allSeen = data !== undefined && data.courses.length === 0 && seenCourseIds.length > 0

  return (
    <>
      <div className="brand-row">
        <Link to="/find" className="back">
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
          <CourseCard key={course.courseId} course={course} />
        ))}

        {allSeen && (
          <>
            <p className="state">이 조건의 코스를 모두 봤어요.</p>
            <button type="button" className="secondary" onClick={() => setSeenCourseIds([])}>
              처음 결과로 돌아가기
            </button>
          </>
        )}
        {data?.hasMore && (
          <button type="button" className="secondary" onClick={showNext}>
            다른 코스 보기
          </button>
        )}
      </div>
    </>
  )
}

export default RecommendationPage
