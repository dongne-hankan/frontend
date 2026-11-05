import { useEffect, useRef, useState } from 'react'
import { loadKakaoMaps, type KakaoMap, type KakaoMaps } from '../../../shared/lib/kakaoMaps'
import type { NearbyStop, Point } from '../api/nearbyApi'

// 대구시청 주변. 위치를 고르기 전 처음 보여줄 곳이다.
const DEFAULT_CENTER: Point = { lat: 35.8714, lng: 128.6014 }
const DEFAULT_LEVEL = 5

interface LoadedMap {
  maps: KakaoMaps
  map: KakaoMap
}

function element(className: string, text: string) {
  const node = document.createElement('div')
  node.className = className
  node.textContent = text
  return node
}

function NearbyMap({
  point,
  stops,
  onSelectPoint,
}: {
  point: Point | null
  stops: NearbyStop[]
  onSelectPoint: (point: Point) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelectPoint)
  const initialPointRef = useRef(point)
  const [loaded, setLoaded] = useState<LoadedMap>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelectPoint
  })

  // 지도는 한 번만 만들고, 위치와 장소는 아래 effect에서 갱신한다.
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
        const start = initialPointRef.current ?? DEFAULT_CENTER
        const map = new maps.Map(container, {
          center: new maps.LatLng(start.lat, start.lng),
          level: DEFAULT_LEVEL,
        })
        maps.event.addListener(map, 'click', ({ latLng }) =>
          onSelectRef.current({ lat: latLng.getLat(), lng: latLng.getLng() }),
        )
        setLoaded({ maps, map })
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
  }, [])

  useEffect(() => {
    if (!loaded || !point) {
      return
    }
    const { maps, map } = loaded
    const position = new maps.LatLng(point.lat, point.lng)
    const overlay = new maps.CustomOverlay({ map, position, content: element('map-point', '출발'), yAnchor: 1 })
    map.panTo(position)
    return () => overlay.setMap(null)
  }, [loaded, point])

  useEffect(() => {
    if (!loaded || stops.length === 0) {
      return
    }
    const { maps, map } = loaded
    const bounds = new maps.LatLngBounds()
    if (point) {
      bounds.extend(new maps.LatLng(point.lat, point.lng))
    }
    const overlays = stops.map((stop) => {
      const position = new maps.LatLng(stop.lat, stop.lng)
      bounds.extend(position)
      return new maps.CustomOverlay({ map, position, content: element('map-pin', String(stop.order)), yAnchor: 1 })
    })
    map.setBounds(bounds)
    return () => overlays.forEach((overlay) => overlay.setMap(null))
  }, [loaded, stops, point])

  if (failed) {
    return <div className="map-fallback">지도를 불러오지 못했어요. 새로고침해 주세요.</div>
  }
  return <div ref={containerRef} className="nearby-map" role="region" aria-label="출발할 위치를 고르는 지도" />
}

export default NearbyMap
