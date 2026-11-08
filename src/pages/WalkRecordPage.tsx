import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import type { NearbyCourse, Point } from '../features/map/api/nearbyApi'
import { useRecordWalk, type RecordCreated } from '../features/my/api/myApi'
import RecordForm from '../features/my/components/RecordForm'
import { errorMessage } from '../shared/api/client'

interface WalkState {
  course: NearbyCourse
  tagId: number
  center: Point
}

function WalkRecordPage() {
  const walk = useLocation().state as WalkState | null
  const recordWalk = useRecordWalk()
  const [created, setCreated] = useState<RecordCreated>()

  if (!walk) {
    return <Navigate to="/" replace />
  }

  const { course, tagId, center } = walk

  return (
    <>
      <div className="brand-row">
        <Link to="/" className="back">
          ← 지도로 돌아가기
        </Link>
        <span className="small-label">다녀온 기록</span>
      </div>
      {!created && (
        <>
          <div className="content content-head">
            <div className="screen-intro">
              <p className="small-label">{course.name}</p>
              <h2>
                오늘의 산책은
                <br />
                어떠셨나요?
              </h2>
              <p>기록은 나만 볼 수 있고, 내 한 칸을 채우며 다음 추천에 반영돼요.</p>
            </div>
          </div>
          <RecordForm
            submitLabel="내 느낌 남기기"
            pending={recordWalk.isPending}
            error={recordWalk.error ? errorMessage(recordWalk.error) : undefined}
            onSubmit={(values) =>
              recordWalk.mutate(
                {
                  ...values,
                  course: {
                    name: course.name,
                    intro: course.intro,
                    durationMinutes: course.durationMinutes,
                    tagId,
                    center,
                    stops: course.stops.map((stop) => ({
                      order: stop.order,
                      kakaoPlaceId: stop.kakaoPlaceId,
                      kakaoPlaceUrl: stop.kakaoPlaceUrl,
                      stayMinutes: stop.stayMinutes,
                      moveMinutesToNext: stop.moveMinutesToNext,
                    })),
                  },
                },
                { onSuccess: setCreated },
              )
            }
          />
        </>
      )}
      {created && (
        <div className="content">
          <div className="screen-intro">
            <p className="small-label">동네 {created.neighborhood.visitedRegionCount}곳을 다녀왔어요</p>
            <h2>
              {created.neighborhood.newRegion
                ? '새로운 동네를 만났어요.'
                : created.neighborhood.newlyFilled
                  ? '한 칸이 채워졌어요.'
                  : '기록을 남겼어요.'}
            </h2>
            <p>이제 추천이 내 기록에 맞춰 달라져요.</p>
          </div>
          <Link className="primary" to="/my">
            내 한 칸 보기 <span aria-hidden="true">→</span>
          </Link>
          <Link className="secondary spaced" to="/">
            다른 산책 찾기
          </Link>
        </div>
      )}
    </>
  )
}

export default WalkRecordPage
