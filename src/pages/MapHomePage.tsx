import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Duration } from '../features/find/api/findApi'
import { useNearbyRecommendation, type Point } from '../features/map/api/nearbyApi'
import NearbyMap from '../features/map/components/NearbyMap'
import { errorMessage } from '../shared/api/client'
import { minutesLabel } from '../shared/lib/format'

const DURATIONS: { code: Duration; label: string }[] = [
  { code: 'MIN_30', label: '30분' },
  { code: 'HOUR_1', label: '1시간' },
]

const MOOD_LIMIT = 100

function pointFromParams(params: URLSearchParams): Point | null {
  const lat = Number(params.get('lat'))
  const lng = Number(params.get('lng'))
  return lat && lng ? { lat, lng } : null
}

function MapHomePage() {
  const [params] = useSearchParams()
  const initialPoint = useMemo(() => pointFromParams(params), [params])
  const [point, setPoint] = useState<Point | null>(initialPoint)
  const [duration, setDuration] = useState<Duration>('MIN_30')
  const [mood, setMood] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string>()
  const recommendation = useNearbyRecommendation()

  const courses = recommendation.data?.courses ?? []
  const selectedCourse = courses[selectedIndex]

  const selectPoint = (next: Point) => {
    setPoint(next)
    setLocationError(undefined)
    recommendation.reset()
  }

  const locateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('이 브라우저에서는 현재 위치를 쓸 수 없어요. 지도를 눌러 골라 주세요.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false)
        selectPoint({ lat: coords.latitude, lng: coords.longitude })
      },
      () => {
        setLocating(false)
        setLocationError('현재 위치를 가져오지 못했어요. 지도를 눌러 골라 주세요.')
      },
      { timeout: 8000 },
    )
  }

  const recommend = () => {
    if (point) {
      setSelectedIndex(0)
      recommendation.mutate({ ...point, duration, mood: mood.trim() || undefined })
    }
  }

  return (
    <>
      <div className="brand-row">
        <span className="brand">동네 한 칸</span>
      </div>
      <div className="map-stage">
        <NearbyMap point={point} stops={selectedCourse?.stops ?? []} onSelectPoint={selectPoint} />
        <button type="button" className="map-locate" disabled={locating} onClick={locateMe}>
          {locating ? '찾는 중' : '내 위치'}
        </button>
      </div>
      <div className="content">
        <p className="small-label map-guide">
          {point ? '이 주변에서 걸을 곳을 찾아볼게요.' : '지도를 눌러 출발할 곳을 골라 주세요.'}
        </p>
        {locationError && <p className="notice">{locationError}</p>}

        <div className="label-row">
          <h3>낼 수 있는 시간</h3>
        </div>
        <div className="options">
          {DURATIONS.map((item) => (
            <button
              key={item.code}
              type="button"
              className="option"
              aria-pressed={item.code === duration}
              onClick={() => setDuration(item.code)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label htmlFor="mood" className="field-label field-gap">
          지금 기분이나 원하는 것
          <span className="field-hint">선택</span>
        </label>
        <input
          id="mood"
          className="text-input"
          value={mood}
          maxLength={MOOD_LIMIT}
          placeholder="예: 퇴근하고 머리가 복잡해요. 조용히 걷고 싶어요."
          onChange={(event) => setMood(event.target.value)}
        />

        {recommendation.isPending && <p className="state">AI가 주변을 살펴보고 있어요.</p>}
        {recommendation.error && <p className="notice">{errorMessage(recommendation.error)}</p>}
        {recommendation.data?.message && <p className="notice">{recommendation.data.message}</p>}

        {courses.length > 0 && (
          <section className="section">
            <div className="label-row">
              <h3>추천 코스</h3>
              {recommendation.data?.aiGenerated && <span className="ai-badge">AI가 추천했어요</span>}
            </div>
            {courses.map((course, index) => (
              <button
                key={`${course.name}-${index}`}
                type="button"
                className="course course-select"
                aria-pressed={index === selectedIndex}
                onClick={() => setSelectedIndex(index)}
              >
                <span>
                  장소 {course.stops.length}곳 · {minutesLabel(course.durationMinutes)}
                </span>
                <h3>{course.name}</h3>
                <p className="course-desc">{course.intro}</p>
                <p className="course-quote">{course.reason}</p>
              </button>
            ))}
            {selectedCourse && (
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
                      {stop.moveMinutesToNext !== null && <p>다음 장소까지 {stop.moveMinutesToNext}분</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {selectedCourse?.courseId && (
              <Link className="secondary spaced" to={`/courses/${selectedCourse.courseId}`}>
                코스 자세히 보기
              </Link>
            )}
          </section>
        )}
      </div>
      <div className="actions">
        <button type="button" className="primary" disabled={!point || recommendation.isPending} onClick={recommend}>
          이 주변 산책 추천받기 <span aria-hidden="true">→</span>
        </button>
      </div>
    </>
  )
}

export default MapHomePage
