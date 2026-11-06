import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useCourse } from '../features/course/api/courseApi'
import { useCreateRecord, type RecordCreated } from '../features/my/api/myApi'
import RecordForm from '../features/my/components/RecordForm'
import { errorMessage } from '../shared/api/client'
import { tokenStore } from '../shared/auth/tokenStore'

function RecordPage() {
  const { courseId } = useParams()
  const { data: course, isPending, error } = useCourse(courseId)
  const createRecord = useCreateRecord()
  const [created, setCreated] = useState<RecordCreated>()

  if (!tokenStore.isLoggedIn()) {
    return <Navigate to={`/login?next=${encodeURIComponent(`/courses/${courseId}/record`)}`} replace />
  }

  const nextParams =
    course && course.tags.length > 0
      ? new URLSearchParams({
          regionId: String(course.region.regionId),
          tagId: String(course.tags[0].tagId),
          duration: 'HOUR_1',
        })
      : null

  return (
    <>
      <div className="brand-row">
        <Link to={`/courses/${courseId}`} className="back">
          ← 코스로 돌아가기
        </Link>
        <span className="small-label">다녀온 기록</span>
      </div>
      {(isPending || error) && (
        <div className="content">
          <p className="state">{error ? errorMessage(error) : '코스를 불러오고 있어요.'}</p>
        </div>
      )}
      {course && !created && (
        <>
          <div className="content content-head">
            <div className="screen-intro">
              <p className="small-label">{course.name}</p>
              <h2>
                오늘의 동네는
                <br />
                어떠셨나요?
              </h2>
              <p>기록은 나만 볼 수 있고, 다음 추천에 반영돼요.</p>
            </div>
          </div>
          <RecordForm
            submitLabel="내 느낌 남기기"
            pending={createRecord.isPending}
            error={createRecord.error ? errorMessage(createRecord.error) : undefined}
            onSubmit={(values) =>
              createRecord.mutate({ ...values, courseId: course.courseId }, { onSuccess: setCreated })
            }
          />
        </>
      )}
      {created && (
        <div className="content">
          <div className="screen-intro">
            <p className="small-label">
              {created.neighborhood.filledCellCount} / {created.neighborhood.totalCellCount}칸
            </p>
            <h2>{created.neighborhood.newlyFilled ? '한 칸이 채워졌어요.' : '기록을 남겼어요.'}</h2>
            <p>이제 추천이 내 기록에 맞춰 달라져요.</p>
          </div>
          <Link className="primary" to={nextParams ? `/recommendations?${nextParams}` : '/'}>
            다음 추천 보기 <span aria-hidden="true">→</span>
          </Link>
          <Link className="secondary spaced" to="/my">
            내 한 칸 보기
          </Link>
        </div>
      )}
    </>
  )
}

export default RecordPage
