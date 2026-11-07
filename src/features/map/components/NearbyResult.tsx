import { useState, type Ref } from 'react'
import { Link } from 'react-router-dom'
import { minutesLabel } from '../../../shared/lib/format'
import type { NearbyCourse } from '../api/nearbyApi'

function NearbyResult({
  courses,
  aiGenerated,
  resultRef,
  onSelectCourse,
}: {
  courses: NearbyCourse[]
  aiGenerated: boolean
  resultRef?: Ref<HTMLElement>
  onSelectCourse?: (course: NearbyCourse) => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedCourse = courses[selectedIndex] ?? courses[0]

  const select = (index: number) => {
    setSelectedIndex(index)
    onSelectCourse?.(courses[index])
  }

  if (!selectedCourse) {
    return null
  }

  return (
    <section className="section" ref={resultRef}>
      <div className="label-row">
        <h3>추천 코스</h3>
        {aiGenerated && <span className="ai-badge">AI가 추천했어요</span>}
      </div>
      {courses.map((course, index) => {
        const body = (
          <>
            <span>
              장소 {course.stops.length}곳 · {minutesLabel(course.durationMinutes)}
            </span>
            <h3>{course.name}</h3>
            <p className="course-desc">{course.intro}</p>
            <p className="course-quote">{course.reason}</p>
          </>
        )
        // 코스가 하나면 고를 것이 없으니 일반 카드로 보여준다.
        return courses.length > 1 ? (
          <button
            key={`${course.name}-${index}`}
            type="button"
            className="course course-select"
            aria-pressed={index === selectedIndex}
            onClick={() => select(index)}
          >
            {body}
          </button>
        ) : (
          <div key={`${course.name}-${index}`} className="course">
            {body}
          </div>
        )
      })}
      <ol className="stops">
        {selectedCourse.stops.map((stop) => (
          <li className="stop" key={stop.order}>
            <span className="stop-number">{stop.order}</span>
            <div>
              <div className="stop-title">
                {stop.name}
                <span>{stop.stayMinutes}분</span>
              </div>
              <p>{stop.address}</p>
              <p>{stop.reason}</p>
              {stop.moveMinutesToNext !== null && <p>다음 장소까지 걸어서 약 {stop.moveMinutesToNext}분</p>}
              {stop.kakaoPlaceUrl && (
                <div className="link-row">
                  <a className="place-link" href={stop.kakaoPlaceUrl} target="_blank" rel="noopener">
                    카카오맵에서 보기 ↗
                  </a>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      {selectedCourse.courseId && (
        <Link className="secondary spaced" to={`/courses/${selectedCourse.courseId}`}>
          코스 자세히 보기
        </Link>
      )}
    </section>
  )
}

export default NearbyResult
