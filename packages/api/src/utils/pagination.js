/** @type {import('@web3-storage/db').SortField[]} */
const sortableValues = ['Name', 'Date']
/** @type {import('@web3-storage/db').SortOrder[]} */
const sortableOrders = ['Asc', 'Desc']

/**
 * Get a parsed and validated list of pagination properties to pass to the DB query.
 * This standard is used across the website
 *
 * It accepts the searchParams from the request url
 * This can be generated from:
 * @example
 * ```js
 * const requestUrl = new URL(request.url)
 * const { searchParams } = requestUrl
 * ```
 *
 * @param  {URLSearchParams} searchParams
 * @returns {import('@web3-storage/db').PageRequest}
 */
export function pagination (searchParams) {
  let size
  if (searchParams.has('size')) {
    const parsedSize = parseInt(searchParams.get('size') ?? '')
    if (isNaN(parsedSize) || parsedSize <= 0 || parsedSize > 1000) {
      throw Object.assign(new Error('invalid page size'), { status: 400 })
    }
    size = parsedSize
  }

  if (!searchParams.has('page')) {
    let before = new Date()
    if (searchParams.has('before')) {
      const parsedBefore = new Date(searchParams.get('before') ?? '')
      if (isNaN(parsedBefore.getTime())) {
        throw Object.assign(new Error('invalid before date'), { status: 400 })
      }
      before = parsedBefore
    }
    return { before, size }
  }

  const page = parseInt(searchParams.get('page') ?? '')
  if (isNaN(page) || page <= 0) {
    throw Object.assign(new Error('invalid page number'), { status: 400 })
  }

  let sortOrder
  if (searchParams.has('sortOrder')) {
    sortOrder = searchParams.get('sortOrder')
    // @ts-ignore
    if (!sortableOrders.includes(sortOrder)) {
      throw Object.assign(new Error(`Sort ordering by '${sortOrder}' is not supported. Supported sort orders are: [${sortableOrders.toString()}]`), { status: 400 })
    }
  }

  let sortBy
  if (searchParams.has('sortBy')) {
    sortBy = searchParams.get('sortBy') ?? undefined
    // @ts-ignore
    if (!sortableValues.includes(sortBy)) {
      throw Object.assign(new Error(`Sorting by '${sortBy}' is not supported. Supported sort orders are: [${sortableValues.toString()}]`), { status: 400 })
    }
  }

  // @ts-ignore
  return { page, size, sortBy, sortOrder }
}
