import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFindOptions, type Duration } from '../features/find/api/findApi'
import { errorMessage } from '../shared/api/client'
import { regionLabel } from '../shared/lib/format'

function HomePage() {
  const navigate = useNavigate()
  const { data: options, isPending, error } = useFindOptions()
  const [selectedRegionId, setRegionId] = useState<number>()
  const [selectedTagId, setTagId] = useState<number>()
  const [selectedDuration, setDuration] = useState<Duration>()

  const regionId = selectedRegionId ?? options?.regions[0]?.regionId
  const tagId = selectedTagId ?? options?.tags[0]?.tagId
  const duration = selectedDuration ?? options?.durations[0]?.code
  const ready = regionId !== undefined && tagId !== undefined && duration !== undefined

  const findCourses = () => {
    if (ready) {
      navigate(`/recommendations?${new URLSearchParams({ regionId: String(regionId), tagId: String(tagId), duration })}`)
    }
  }

  return (
    <>
      <div className="brand-row">
        <span className="brand">동네 한 칸</span>
      </div>
      <div className="content">
        <div className="screen-intro">
          <p className="small-label">새 동네와 조금 가까워지는 시간</p>
          <h2>
            이 동네에,
            <br />
            내가 좋아할 곳은?
          </h2>
          <p>대구·경북 주민들의 일상에서 찾아보세요.</p>
        </div>

        {isPending && <p className="state">선택지를 불러오고 있어요.</p>}
        {error && <p className="state">{errorMessage(error)}</p>}
        {options && (
          <>
            <label htmlFor="region" className="field-label">
              어느 동네에서 시작할까요?
            </label>
            <select
              id="region"
              className="region-select"
              value={regionId}
              onChange={(event) => setRegionId(Number(event.target.value))}
            >
              {options.regions.map((region) => (
                <option key={region.regionId} value={region.regionId}>
                  {regionLabel(region)}
                </option>
              ))}
            </select>

            <div className="label-row">
              <h3>오늘은 어떤 시간이 필요한가요?</h3>
            </div>
            <div className="options">
              {options.tags.map((tag) => (
                <button
                  key={tag.tagId}
                  type="button"
                  className="option"
                  aria-pressed={tag.tagId === tagId}
                  onClick={() => setTagId(tag.tagId)}
                >
                  {tag.phrase}
                </button>
              ))}
            </div>

            <div className="inline-field">
              <label htmlFor="duration">낼 수 있는 시간</label>
              <select
                id="duration"
                value={duration}
                onChange={(event) => setDuration(event.target.value as Duration)}
              >
                {options.durations.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="feeling-box">
          <h3 className="field-label">이곳을 좋아하는 사람들의 방식으로</h3>
          <p>
            어디에 갈지만큼,
            <br />
            왜 좋아하는지와 어떻게 즐기는지도 함께 봐요.
          </p>
        </div>
      </div>
      <div className="actions">
        <button type="button" className="primary" disabled={!ready} onClick={findCourses}>
          주민의 일상 만나보기 <span aria-hidden="true">→</span>
        </button>
      </div>
    </>
  )
}

export default HomePage
