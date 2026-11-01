import { Link } from 'react-router-dom'
import { minutesLabel } from '../../../shared/lib/format'
import type { CourseSummary } from '../api/findApi'

function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link className="course" to={`/courses/${course.courseId}`}>
      <span>
        {course.region.name} · 장소 {course.stopCount}곳 · {minutesLabel(course.durationMinutes)}
      </span>
      <h3>{course.name}</h3>
      <p className="course-desc">{course.intro}</p>
      <div className="tag-line">
        {course.tags.map((tag) => (
          <span key={tag.tagId}>{tag.name}</span>
        ))}
      </div>
      {course.highlightQuote && <p className="course-quote">“{course.highlightQuote}”</p>}
    </Link>
  )
}

export default CourseCard
