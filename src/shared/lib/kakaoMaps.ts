export interface LatLng {
  getLat(): number
  getLng(): number
}

export interface KakaoMap {
  setBounds(bounds: LatLngBounds): void
  setCenter(position: LatLng): void
  setLevel(level: number): void
  panTo(position: LatLng): void
}

export interface LatLngBounds {
  extend(position: LatLng): void
}

export interface CustomOverlay {
  setMap(map: KakaoMap | null): void
}

export type ServiceStatus = 'OK' | 'ZERO_RESULT' | 'ERROR'

export interface KeywordResult {
  id: string
  place_name: string
  address_name: string
  road_address_name: string
  x: string
  y: string
}

export interface AddressResult {
  address_name: string
  x: string
  y: string
  road_address: { address_name: string } | null
}

export interface CoordAddress {
  address: { address_name: string } | null
  road_address: { address_name: string } | null
}

export interface KakaoServices {
  SortBy: { ACCURACY: string; DISTANCE: string }
  Places: new () => {
    keywordSearch(
      keyword: string,
      callback: (data: KeywordResult[], status: ServiceStatus) => void,
      options?: { size?: number; location?: LatLng; sort?: string },
    ): void
  }
  Geocoder: new () => {
    addressSearch(address: string, callback: (data: AddressResult[], status: ServiceStatus) => void): void
    coord2Address(lng: number, lat: number, callback: (data: CoordAddress[], status: ServiceStatus) => void): void
  }
}

export interface KakaoMaps {
  load(callback: () => void): void
  services: KakaoServices
  LatLng: new (lat: number, lng: number) => LatLng
  LatLngBounds: new () => LatLngBounds
  Map: new (container: HTMLElement, options: { center: LatLng; level: number }) => KakaoMap
  CustomOverlay: new (options: {
    map: KakaoMap
    position: LatLng
    content: HTMLElement
    yAnchor: number
  }) => CustomOverlay
  event: {
    addListener(target: KakaoMap, type: 'click', handler: (event: { latLng: LatLng }) => void): void
  }
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps }
  }
}

let loading: Promise<KakaoMaps> | null = null

function loadScript() {
  return new Promise<KakaoMaps>((resolve, reject) => {
    const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY
    if (!appKey) {
      reject(new Error('Kakao map key is missing'))
      return
    }
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`
    script.onerror = () => {
      script.remove()
      reject(new Error('Kakao map script failed'))
    }
    script.onload = () => {
      const maps = window.kakao?.maps
      if (maps) {
        maps.load(() => resolve(maps))
      } else {
        reject(new Error('Kakao map is unavailable'))
      }
    }
    document.head.append(script)
  })
}

export function loadKakaoMaps() {
  loading ??= loadScript().catch((error: unknown) => {
    loading = null
    throw error
  })
  return loading
}
