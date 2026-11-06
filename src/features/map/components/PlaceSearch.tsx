import { useRef, useState, type FormEvent } from 'react'
import type { Point } from '../api/nearbyApi'
import { searchPlaces, type PlaceResult } from '../api/placeSearch'

function PlaceSearch({ near, onSelect }: { near: Point; onSelect: (place: PlaceResult) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const latest = useRef(0)

  const search = async (event: FormEvent) => {
    event.preventDefault()
    const keyword = query.trim()
    if (!keyword) {
      return
    }
    const id = ++latest.current
    setPending(true)
    setError(undefined)
    try {
      const found = await searchPlaces(keyword, near)
      if (id === latest.current) {
        setResults(found)
      }
    } catch {
      if (id === latest.current) {
        setResults(undefined)
        setError('검색하지 못했어요. 잠시 후 다시 시도하거나 지도를 눌러 골라 주세요.')
      }
    } finally {
      if (id === latest.current) {
        setPending(false)
      }
    }
  }

  const choose = (place: PlaceResult) => {
    setQuery(place.name)
    setResults(undefined)
    onSelect(place)
  }

  return (
    <form className="place-search" role="search" onSubmit={search}>
      <label htmlFor="place-query" className="sr-only">
        출발할 장소나 주소
      </label>
      <div className="search-row">
        <input
          id="place-query"
          className="text-input"
          type="search"
          enterKeyHint="search"
          value={query}
          placeholder="장소나 주소 (예: 대구역)"
          onChange={(event) => {
            setQuery(event.target.value)
            setResults(undefined)
          }}
          onKeyDown={(event) => event.key === 'Escape' && setResults(undefined)}
        />
        <button type="submit" className="search-button" disabled={pending || !query.trim()}>
          {pending ? '찾는 중' : '검색'}
        </button>
      </div>
      {error && <p className="notice">{error}</p>}
      {results?.length === 0 && (
        <p className="search-empty">‘{query.trim()}’에 맞는 곳이 없어요. 다른 이름이나 주소로 찾아 주세요.</p>
      )}
      {results && results.length > 0 && (
        <ul className="search-results" aria-label="검색 결과">
          {results.map((place) => (
            <li key={place.id}>
              <button type="button" onClick={() => choose(place)}>
                <strong>{place.name}</strong>
                {place.address !== place.name && <span>{place.address}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}

export default PlaceSearch
