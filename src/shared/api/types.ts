export interface ApiResponse<T> {
  data: T
}

export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  hasNext: boolean
}

export interface ApiError {
  code: string
  message: string
  errors: { field: string; message: string }[]
}
