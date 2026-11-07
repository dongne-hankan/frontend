import { useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFindOptions, type Duration } from '../features/find/api/findApi'
import { DEFAULT_CENTER, useNearbyRecommendation, type Point } from '../features/map/api/nearbyApi'
import { addressOf } from '../features/map/api/placeSearch'
import NearbyMap from '../features/map/components/NearbyMap'
import NearbyResult from '../features/map/components/NearbyResult'
import PlaceSearch from '../features/map/components/PlaceSearch'
import { errorMessage } from '../shared/api/client'

const DURATIONS: { code: Duration; label: string }[] = [
  { code: 'MIN_30', label: '30분' },
  { code: 'HOUR_1', label: '1시간' },
]

const MOOD_LIMIT = 100

const SEARCH_HINT = '위에서 장소나 주소로 검색하거나 지도를 눌러 골라 주세요.'

function locationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return `위치 권한이 꺼져 있어요. ${SEARCH_HINT}`
  }
  if (error.code === error.TIMEOUT) {
    return `현재 위치를 찾는 데 시간이 너무 걸려요. ${SEARCH_HINT}`
  }
  return `현재 위치를 가져오지 못했어요. ${SEARCH_HINT}`
}

function pointFromParams(params: URLSearchParams): Point | null {
  const lat = Number(params.get('lat'))
  const lng = Number(params.get('lng'))
  return lat && lng ? { lat, lng } : null
}

function MapHomePage() {
  const [params] = useSearchParams()
  const initialPoint = useMemo(() => pointFromParams(params), [params])
  const [point, setPoint] = useState<Point | null>(initialPoint)
  const [pointLabel, setPointLabel] = useState<string>()
  const [duration, setDuration] = useState<Duration>('MIN_30')
  const [mood, setMood] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState<string>()
  const recommendation = useNearbyRecommendation()
  const navigate = useNavigate()
  const { data: options } = useFindOptions()
  const [selectedTagId, setSelectedTagId] = useState<number>()
  const tagId = selectedTagId ?? options?.tags[0]?.tagId
  const resultRef = useRef<HTMLElement>(null)
  const labelRequest = useRef(0)

  const courses = recommendation.data?.courses ?? []
  const selectedCourse = courses[selectedIndex]

  // 지도를 누르거나 내 위치를 쓰면 이름이 없으니 주소를 찾아 어디를 골랐는지 보여준다.
  const selectPoint = (next: Point, label?: string) => {
    const request = ++labelRequest.current
    setPoint(next)
    setPointLabel(label)
    setLocationError(undefined)
    recommendation.reset()
    if (!label) {
      addressOf(next)
        .then((address) => {
          if (address && request === labelRequest.current) {
            setPointLabel(address)
          }
        })
        .catch(() => undefined)
    }
  }

  // 시간을 바꾸면 이전 시간 기준의 결과가 남아 헷갈리므로 지운다.
  const selectDuration = (next: Duration) => {
    setDuration(next)
    recommendation.reset()
  }

  const selectTag = (next: number) => {
    setSelectedTagId(next)
    recommendation.reset()
  }

  const recordWalk = () => {
    const center = recommendation.data?.center ?? point
    if (selectedCourse && center && tagId !== undefined) {
      navigate('/walks/record', { state: { course: selectedCourse, tagId, center } })
    }
  }

  const locateMe = () => {
    const failLocating = (message: string) => {
      setLocating(false)
      setLocationError(message)
      document.getElementById('place-query')?.focus()
    }
    if (!navigator.geolocation) {
      failLocating(`이 브라우저에서는 현재 위치를 쓸 수 없어요. ${SEARCH_HINT}`)
      return
    }
    setLocating(true)
    setLocationError(undefined)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false)
        selectPoint({ lat: coords.latitude, lng: coords.longitude })
      },
      (error) => failLocating(locationErrorMessage(error)),
      { timeout: 8000, maximumAge: 60000 },
    )
  }

  const recommend = (event?: FormEvent) => {
    event?.preventDefault()
    if (point && !recommendation.isPending) {
      setSelectedIndex(0)
      recommendation.mutate(
        { ...point, duration, tagId, mood: mood.trim() || undefined },
        { onSuccess: () => requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' })) },
      )
    }
  }

  return (
    <>
      <div className="brand-row">
        <span className="brand">동네 한 칸</span>
      </div>
      <PlaceSearch near={point ?? DEFAULT_CENTER} onSelect={(place) => selectPoint(place, place.name)} />
      <div className="map-stage">
        <NearbyMap point={point} stops={selectedCourse?.stops ?? []} onSelectPoint={(next) => selectPoint(next)} />
        <button type="button" className="map-locate" disabled={locating} onClick={locateMe}>
          {locating ? '찾는 중' : '내 위치'}
        </button>
      </div>
      <form id="nearby-form" className="content" onSubmit={recommend}>
        {locationError && (
          <p className="notice" role="alert">
            {locationError}
          </p>
        )}
        <p className="map-guide" aria-live="polite">
          {point ? (
            <>
              <span className="small-label">출발</span>
              <strong>{pointLabel ?? '지도에서 고른 위치'}</strong>
            </>
          ) : (
            <span className="map-hint">내 위치를 쓰거나, 장소를 검색하거나, 지도를 눌러 출발할 곳을 골라 주세요.</span>
          )}
        </p>

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
              onClick={() => selectDuration(item.code)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {options && (
          <>
            <div className="label-row">
              <h3>어떤 시간을 보내고 싶나요?</h3>
            </div>
            <div className="options">
              {options.tags.map((tag) => (
                <button
                  key={tag.tagId}
                  type="button"
                  className="option"
                  aria-pressed={tag.tagId === tagId}
                  onClick={() => selectTag(tag.tagId)}
                >
                  {tag.phrase}
                </button>
              ))}
            </div>
          </>
        )}

        <label htmlFor="mood" className="field-label field-gap">
          지금 기분이나 원하는 것
          <span className="field-hint">선택</span>
        </label>
        <input
          id="mood"
          className="text-input"
          value={mood}
          maxLength={MOOD_LIMIT}
          placeholder="예: 조용히 걷고 싶어요"
          onChange={(event) => setMood(event.target.value)}
        />

        {recommendation.isPending && <p className="state">주변 장소를 살펴보고 있어요.</p>}
        {recommendation.error && <p className="notice">{errorMessage(recommendation.error)}</p>}
        {recommendation.data?.message && (
          <div className="notice">
            {recommendation.data.message}
          </div>
        )}

        {courses.length > 0 && (
          <NearbyResult
            key={recommendation.submittedAt}
            courses={courses}
            aiGenerated={recommendation.data?.aiGenerated ?? false}
            resultRef={resultRef}
            onSelectCourse={(course) => setSelectedIndex(courses.indexOf(course))}
            action={
              <button type="button" className="secondary spaced" onClick={recordWalk}>
                다녀왔어요 ✓
              </button>
            }
          />
        )}
      </form>
      <div className="actions">
        <button type="submit" form="nearby-form" className="primary" disabled={!point || recommendation.isPending}>
          {recommendation.isPending ? '추천을 찾고 있어요' : courses.length > 0 ? '다시 추천받기' : '이 주변 산책 추천받기'}{' '}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </>
  )
}

export default MapHomePage
