import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useUpdateRecord, type VisitRecord } from '../features/my/api/myApi'
import RecordForm from '../features/my/components/RecordForm'
import { errorMessage } from '../shared/api/client'

function EditRecordPage() {
  const navigate = useNavigate()
  const record = useLocation().state as VisitRecord | null
  const updateRecord = useUpdateRecord()

  if (!record) {
    return <Navigate to="/my" replace />
  }

  return (
    <>
      <div className="brand-row">
        <Link to="/my" className="back">
          ← 내 한 칸
        </Link>
        <span className="small-label">{record.course.name}</span>
      </div>
      <RecordForm
        initial={{ feeling: record.feeling, memo: record.memo ?? '', visitedOn: record.visitedOn }}
        submitLabel="기록 고치기"
        pending={updateRecord.isPending}
        error={updateRecord.error ? errorMessage(updateRecord.error) : undefined}
        onSubmit={(values) =>
          updateRecord.mutate(
            { ...values, recordId: record.recordId },
            { onSuccess: () => navigate('/my', { replace: true }) },
          )
        }
      />
    </>
  )
}

export default EditRecordPage
