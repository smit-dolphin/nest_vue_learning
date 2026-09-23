export interface PaginationMeta {
  totalData: number
  totalPages: number
  currentPage: number
  itemPerPage: number
}

export interface PaginatedList<T> {
  status: number
  message: string
  data: T[]
  meta: PaginationMeta
  success: boolean
}

export interface PaginationParams {
  page?: number | string
  limit?: number | string
}

export interface ListQueryParams extends PaginationParams {
  search?: string
  from?: string
  to?: string
}

// The UI does not have pagination controls yet, so request a large page to
// keep the existing list views working while the API is paginated.
export const MAX_LIST_LIMIT = 100

export function emptyPage<T>(): PaginatedList<T> {
  return {
    status: 200,
    message: '',
    data: [],
    meta: {
      totalData: 0,
      totalPages: 0,
      currentPage: 1,
      itemPerPage: 0,
    },
    success: true,
  }
}