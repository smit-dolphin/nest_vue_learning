export interface ApiResponse<T = unknown> {
  status: number
  message: string
  data: T
  meta?: PaginationMeta
  success: boolean
}

export interface PaginationMeta {
  totalData: number
  totalPages: number
  currentPage: number
  itemPerPage: number
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}

export interface ListQuery {
  page?: number | string
  limit?: number | string
  search?: string
  from?: string
  to?: string
}

export function unwrap<T>(result: unknown): ApiResponse<T> {
  return result as ApiResponse<T>
}