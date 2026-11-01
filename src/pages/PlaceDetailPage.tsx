import { useNavigate, useParams } from 'react-router-dom'
import { directionsUrl, usePlace } from '../features/course/api/courseApi'
import ResidentStory from '../features/course/components/ResidentStory'
import { errorMessage } from '../shared/api/client'

function PlaceDetailPage() {
  const { placeId } = useParams()
  const navigate = useNavigate()
  const { data: place, isPending, error } = usePlace(placeId)

  return (
    <>
      <div className="brand-row">
        <button type="button" className="back" onClick={() => navigate(-1)}>
          ← 코스로 돌아가기
        </button>
        <span className="small-label">장소 이야기</span>
      </div>
      <div className="content">
        {isPending && <p className="state">장소를 불러오고 있어요.</p>}
        {error && <p className="state">{errorMessage(error)}</p>}
        {place && (
          <>
            <div className="screen-intro">
              <p className="small-label">{place.address}</p>
              <h2>{place.name}</h2>
              <p>정보 확인일 {place.checkedOn}</p>
            </div>
            {place.timeSensitive && <p className="notice">방문 전 영업 여부를 확인하세요.</p>}
            {place.stories.map((story) => (
              <ResidentStory
                key={story.storyId}
                label="주민이 좋아하는 이유"
                residentIntro={story.residentName ?? story.residentIntro}
                reason={story.reason}
                howToEnjoy={story.howToEnjoy}
              />
            ))}
            <div className="link-row">
              <a className="place-link" href={directionsUrl(place)} target="_blank" rel="noopener">
                길찾기 ↗
              </a>
              {place.sourceUrl && (
                <a className="place-link" href={place.sourceUrl} target="_blank" rel="noopener">
                  공식 안내 ↗
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default PlaceDetailPage
