import { Link } from 'react-router-dom'
import {
  feelingLabel,
  useDeleteRecord,
  useNeighborhood,
  useRecords,
  useSavedCourses,
  useUnsaveCourse,
} from '../features/my/api/myApi'
import NeighborhoodGrid from '../features/my/components/NeighborhoodGrid'
import { errorMessage } from '../shared/api/client'
import { tokenStore } from '../shared/auth/tokenStore'
import { minutesLabel } from '../shared/lib/format'

function GuestIntro() {
  return (
    <>
      <div className="content">
        <div className="screen-intro">
          <p className="small-label">조금씩 익숙해지는 우리 동네</p>
          <h2>
            나도 이 동네를
            <br />
            좋아할 이유가 생겨요.
          </h2>
          <p>로그인하면 담은 코스와 다녀온 기록을 모아 볼 수 있어요.</p>
        </div>
      </div>
      <div className="actions">
        <Link className="primary" to="/login?next=/my">
          로그인하기 <span aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  )
}

function SavedCourses() {
  const { data } = useSavedCourses()
  const unsaveCourse = useUnsaveCourse()

  return (
    <section className="section">
      <h3 className="section-title">담은 코스 {data?.totalElements ?? 0}</h3>
      {data?.items.length === 0 && <p className="course-desc">마음에 드는 코스를 담아 보세요.</p>}
      {data?.items.map(({ course, visited }) => (
        <div className="row-card" key={course.courseId}>
          <h4>
            {course.visible ? <Link to={`/courses/${course.courseId}`}>{course.name}</Link> : course.name}
            {visited && <span className="saved-tag">다녀옴</span>}
          </h4>
          <p>
            {course.visible
              ? `${course.region.name} · ${minutesLabel(course.durationMinutes)}`
              : '지금은 볼 수 없는 코스예요.'}
          </p>
          <div className="row-actions">
            <button type="button" className="text-button" onClick={() => unsaveCourse.mutate(course.courseId)}>
              담기 취소
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}

function Records() {
  const { data } = useRecords()
  const deleteRecord = useDeleteRecord()

  const confirmDelete = (recordId: number) => {
    if (window.confirm('이 기록을 지울까요? 지운 기록은 되돌릴 수 없어요.')) {
      deleteRecord.mutate(recordId)
    }
  }

  return (
    <section className="section">
      <h3 className="section-title">다녀온 기록 {data?.totalElements ?? 0}</h3>
      {data?.items.length === 0 && <p className="course-desc">다녀온 코스에 짧은 느낌을 남겨 보세요.</p>}
      {data?.items.map((record) => (
        <div className="row-card" key={record.recordId}>
          <h4>
            {record.course.visible ? (
              <Link to={`/courses/${record.course.courseId}`}>{record.course.name}</Link>
            ) : (
              record.course.name
            )}
          </h4>
          <p>
            {record.visitedOn} · {feelingLabel(record.feeling)}
          </p>
          {record.memo && <p>{record.memo}</p>}
          <div className="row-actions">
            <Link className="text-button" to={`/my/records/${record.recordId}/edit`} state={record}>
              수정
            </Link>
            <button type="button" className="text-button" onClick={() => confirmDelete(record.recordId)}>
              삭제
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}

function MemberNeighborhood() {
  const { data, isPending, error } = useNeighborhood()

  return (
    <div className="content">
      {isPending && <p className="state">내 한 칸을 불러오고 있어요.</p>}
      {error && <p className="state">{errorMessage(error)}</p>}
      {data && (
        <>
          <div className="screen-intro">
            <p className="small-label">
              {data.grid.filledCellCount} / {data.grid.totalCellCount}칸 채웠어요
            </p>
            <h2>{data.summary.topTagMessage ?? '첫 번째 칸을 채워 볼까요?'}</h2>
            <p>
              또 오고 싶어요 {data.summary.feelingCounts.WANT_AGAIN} · 좋았어요 {data.summary.feelingCounts.GOOD} ·
              안 맞았어요 {data.summary.feelingCounts.NOT_FOR_ME}
            </p>
          </div>
          <NeighborhoodGrid grid={data.grid} />
          {data.summary.recordCount === 0 && (
            <Link className="primary spaced-top" to="/">
              첫 코스 찾기 <span aria-hidden="true">→</span>
            </Link>
          )}
          <SavedCourses />
          <Records />
        </>
      )}
    </div>
  )
}

function MyNeighborhoodPage() {
  const loggedIn = tokenStore.isLoggedIn()

  return (
    <>
      <div className="brand-row">
        <span className="brand">내 한 칸</span>
        {loggedIn && (
          <Link to="/my/settings" className="back">
            내 정보
          </Link>
        )}
      </div>
      {loggedIn ? <MemberNeighborhood /> : <GuestIntro />}
    </>
  )
}

export default MyNeighborhoodPage
