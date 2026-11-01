import { useState } from 'react'
import { FEELINGS, type Feeling, type RecordValues } from '../api/myApi'

const MEMO_LIMIT = 50

function today() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
}

function RecordForm({
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
}: {
  initial?: RecordValues
  submitLabel: string
  pending: boolean
  error?: string
  onSubmit: (values: RecordValues) => void
}) {
  const [feeling, setFeeling] = useState<Feeling | undefined>(initial?.feeling)
  const [memo, setMemo] = useState(initial?.memo ?? '')
  const [visitedOn, setVisitedOn] = useState(initial?.visitedOn ?? today())

  return (
    <>
      <div className="content">
        <div className="field-label" id="rating-label">
          다녀와 보니 어땠나요?
        </div>
        <div className="ratings" role="group" aria-labelledby="rating-label">
          {FEELINGS.map((item) => (
            <button
              key={item.value}
              type="button"
              className="rating"
              aria-pressed={item.value === feeling}
              onClick={() => setFeeling(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label htmlFor="memo" className="field-label field-gap">
          기억하고 싶은 한 줄
          <span className="field-hint">
            선택 · {memo.length}/{MEMO_LIMIT}
          </span>
        </label>
        <input
          id="memo"
          className="text-input"
          value={memo}
          maxLength={MEMO_LIMIT}
          placeholder="예: 퇴근하고 잠깐 걷기 좋았어요."
          onChange={(event) => setMemo(event.target.value)}
        />

        <label htmlFor="visited-on" className="field-label field-gap">
          다녀온 날
        </label>
        <input
          id="visited-on"
          type="date"
          className="text-input"
          value={visitedOn}
          max={today()}
          onChange={(event) => setVisitedOn(event.target.value)}
        />
        {error && <p className="notice">{error}</p>}
      </div>
      <div className="actions">
        <button
          type="button"
          className="primary"
          disabled={!feeling || !visitedOn || pending}
          onClick={() => feeling && onSubmit({ feeling, memo: memo.trim(), visitedOn })}
        >
          {submitLabel} <span aria-hidden="true">✓</span>
        </button>
      </div>
    </>
  )
}

export default RecordForm
