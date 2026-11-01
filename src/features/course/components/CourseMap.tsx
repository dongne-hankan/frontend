import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadKakaoMaps } from '../../../shared/lib/kakaoMaps'
import type { CourseStop } from '../api/courseApi'

const SINGLE_STOP_LEVEL = 4

function CourseMap({ stops }: { stops: CourseStop[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedOrder, setSelectedOrder] = useState<number>()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const selected = stops.find((stop) => stop.order === selectedOrder)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }
    let cancelled = false

    loadKakaoMaps()
      .then((maps) => {
        if (cancelled) {
          return
        }
        const positions = stops.map((stop) => new maps.LatLng(stop.place.lat, stop.place.lng))
        const map = new maps.Map(container, { center: positions[0], level: SINGLE_STOP_LEVEL })

        stops.forEach((stop, index) => {
          const pin = document.createElement('button')
          pin.type = 'button'
          pin.className = 'map-pin'
          pin.textContent = String(stop.order)
          pin.setAttribute('aria-label', `${stop.order}번 장소 ${stop.place.name}`)
          pin.addEventListener('click', () => setSelectedOrder(stop.order))
          new maps.CustomOverlay({ map, position: positions[index], content: pin, yAnchor: 1 })
        })

        if (positions.length > 1) {
          const bounds = new maps.LatLngBounds()
          positions.forEach((position) => bounds.extend(position))
          map.setBounds(bounds)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true)
        }
      })

    return () => {
      cancelled = true
      container.replaceChildren()
    }
  }, [stops, attempt])

  if (failed) {
    return (
      <div className="map-fallback">
        지도를 불러오지 못했어요. 장소 목록과 주소로 확인해 주세요.
        <button
          type="button"
          className="text-button map-retry"
          onClick={() => {
            setFailed(false)
            setAttempt(attempt + 1)
          }}
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <>
      <div ref={containerRef} className="course-map" role="region" aria-label="코스 장소 지도" />
      {selected && (
        <div className="map-selected">
          <strong>
            {selected.order}. {selected.place.name}
          </strong>
          {selected.highlightQuote && <p>“{selected.highlightQuote}”</p>}
          <Link className="place-link" to={`/places/${selected.place.placeId}`}>
            장소 이야기 보기
          </Link>
        </div>
      )}
    </>
  )
}

export default CourseMap
