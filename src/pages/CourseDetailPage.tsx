import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useCourse } from '../features/course/api/courseApi'
import CourseMap from '../features/course/components/CourseMap'
import ResidentStory from '../features/course/components/ResidentStory'
import StopList from '../features/course/components/StopList'
import { useSaveCourse, useUnsaveCourse } from '../features/my/api/myApi'
import { errorMessage } from '../shared/api/client'
import { tokenStore } from '../shared/auth/tokenStore'
import { minutesLabel, regionLabel } from '../shared/lib/format'

function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { data: course, isPending, error } = useCourse(courseId)
  const story = course?.stops.find((stop) => stop.highlightStory)
  const [params, setParams] = useSearchParams()
  const saveCourse = useSaveCourse()
  const unsaveCourse = useUnsaveCourse()
  const loggedIn = tokenStore.isLoggedIn()
  const resumed = useRef(false)

  // 비회원이 담기를 누르고 로그인하면 돌아와서 이어서 담는다.
  useEffect(() => {
    if (params.get('save') !== '1' || !course?.me || resumed.current) {
      return
    }
    resumed.current = true
    setParams({}, { replace: true })
    if (!course.me.saved) {
      saveCourse.mutate(course.courseId)
    }
  }, [course, params, saveCourse, setParams])

  const toggleSaved = () => {
    if (course?.me?.saved) {
      unsaveCourse.mutate(course.courseId)
    } else if (course) {
      saveCourse.mutate(course.courseId)
    }
  }

  return (
    <>
      <div className="brand-row">
        <button type="button" className="back" onClick={() => navigate(-1)}>
          ← 코스 목록
        </button>
        <span className="small-label">주민의 일상</span>
      </div>
      <div className="content">
        {isPending && <p className="state">코스를 불러오고 있어요.</p>}
        {error && <p className="state">{errorMessage(error)}</p>}
        {course && (
          <>
            <div className="screen-intro">
              <p className="small-label">{regionLabel(course.region)}의 한 칸</p>
              <h2>{course.name}</h2>
              <p>{course.intro}</p>
            </div>

            {story?.highlightStory && (
              <ResidentStory
                label={`${story.place.name} 이야기`}
                residentIntro={story.highlightStory.residentIntro}
                reason={story.highlightStory.reason}
                howToEnjoy={story.highlightStory.howToEnjoy}
              />
            )}

            <div className="course-meta">
              <span>
                {course.transport} · 장소 {course.stops.length}곳
              </span>
              <span>총 {minutesLabel(course.durationMinutes)}</span>
            </div>
            <div className="tag-line">
              {course.tags.map((tag) => (
                <span key={tag.tagId}>{tag.name}</span>
              ))}
            </div>

            {course.me && course.me.records.length > 0 && (
              <p className="notice">이 코스에 기록을 {course.me.records.length}번 남겼어요.</p>
            )}
            {saveCourse.error && <p className="notice">{errorMessage(saveCourse.error)}</p>}

            <StopList stops={course.stops} storyOrder={story?.order} />
            <CourseMap stops={course.stops} />
          </>
        )}
      </div>
      {course && (
        <div className="actions action-row">
          {loggedIn ? (
            <>
              <button
                type="button"
                className="secondary"
                disabled={saveCourse.isPending || unsaveCourse.isPending}
                onClick={toggleSaved}
              >
                {course.me?.saved ? '담기 취소' : '담기'}
              </button>
              <Link className="primary" to={`/courses/${course.courseId}/record`}>
                다녀왔어요 <span aria-hidden="true">✓</span>
              </Link>
            </>
          ) : (
            <Link
              className="primary"
              to={`/login?next=${encodeURIComponent(`/courses/${course.courseId}?save=1`)}`}
            >
              내 한 칸에 담기 <span aria-hidden="true">＋</span>
            </Link>
          )}
        </div>
      )}
    </>
  )
}

export default CourseDetailPage
