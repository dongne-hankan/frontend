import { Link } from 'react-router-dom'
import { directionsUrl, type CourseStop } from '../api/courseApi'

function StopList({ stops, storyOrder }: { stops: CourseStop[]; storyOrder?: number }) {
  return (
    <ol className="stops">
      {stops.map((stop) => (
        <li className="stop" key={stop.order}>
          <span className="stop-number">{stop.order}</span>
          <div>
            <div className="stop-title">
              <Link to={`/places/${stop.place.placeId}`}>{stop.place.name}</Link>
              <span>{stop.stayMinutes}분</span>
            </div>
            <p>{stop.place.address}</p>
            {stop.highlightQuote && stop.order !== storyOrder && <p>“{stop.highlightQuote}”</p>}
            {stop.place.timeSensitive && <p>방문 전 영업 여부를 확인하세요.</p>}
            {stop.moveMinutesToNext !== null && <p>다음 장소까지 {stop.moveMinutesToNext}분</p>}
            <div className="link-row">
              <a className="place-link" href={directionsUrl(stop.place)} target="_blank" rel="noopener">
                길찾기 ↗
              </a>
              {stop.place.sourceUrl && (
                <a className="place-link" href={stop.place.sourceUrl} target="_blank" rel="noopener">
                  공식 안내 ↗
                </a>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default StopList
