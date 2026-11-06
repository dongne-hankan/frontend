import { loadKakaoMaps, type ServiceStatus } from '../../../shared/lib/kakaoMaps'
import type { Point } from './nearbyApi'

export interface PlaceResult extends Point {
  id: string
  name: string
  address: string
}

const RESULT_LIMIT = 5

function settle<T>(resolve: (value: T[]) => void, reject: (error: Error) => void) {
  return (data: T[], status: ServiceStatus) => {
    if (status === 'ERROR') {
      reject(new Error('Kakao search failed'))
    } else {
      resolve(status === 'OK' ? data : [])
    }
  }
}

// 위경도 차이로 충분하다. 순서만 매기면 된다.
function distance(a: Point, b: Point) {
  return Math.hypot(a.lat - b.lat, (a.lng - b.lng) * Math.cos((a.lat * Math.PI) / 180))
}

function byDistance(near: Point) {
  return (a: PlaceResult, b: PlaceResult) => distance(near, a) - distance(near, b)
}

// "대구 중구 공평로 88" 같은 주소와 "동성로" 같은 장소 이름을 모두 받는다.
// 같은 이름이 전국에 있으니 기준점에서 가까운 곳을 먼저 보여준다.
export async function searchPlaces(query: string, near: Point): Promise<PlaceResult[]> {
  const maps = await loadKakaoMaps()
  const { services } = maps
  const [addresses, keywords] = await Promise.all([
    new Promise<PlaceResult[]>((resolve, reject) =>
      new services.Geocoder().addressSearch(
        query,
        settle(
          (data) =>
            resolve(
              data.map((item) => ({
                id: `address-${item.x}-${item.y}`,
                name: item.road_address?.address_name ?? item.address_name,
                address: item.address_name,
                lat: Number(item.y),
                lng: Number(item.x),
              })),
            ),
          reject,
        ),
      ),
    ),
    new Promise<PlaceResult[]>((resolve, reject) =>
      new services.Places().keywordSearch(
        query,
        settle(
          (data) =>
            resolve(
              data.map((item) => ({
                id: item.id,
                name: item.place_name,
                address: item.road_address_name || item.address_name,
                lat: Number(item.y),
                lng: Number(item.x),
              })),
            ),
          reject,
        ),
        {
          size: RESULT_LIMIT,
          location: new maps.LatLng(near.lat, near.lng),
          sort: services.SortBy.DISTANCE,
        },
      ),
    ),
  ])
  addresses.sort(byDistance(near))
  // 번지수가 있으면 주소를 찾는 것으로 보고 주소 결과를 앞에 둔다.
  const merged = /\d/.test(query) ? [...addresses, ...keywords] : [...keywords, ...addresses]
  return merged.slice(0, RESULT_LIMIT)
}

export async function addressOf(point: Point): Promise<string | null> {
  const { services } = await loadKakaoMaps()
  return new Promise((resolve) =>
    new services.Geocoder().coord2Address(point.lng, point.lat, (data, status) => {
      const first = status === 'OK' ? data[0] : undefined
      resolve(first?.road_address?.address_name ?? first?.address?.address_name ?? null)
    }),
  )
}
