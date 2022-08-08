/**
 * @param  {} searchParams
 */
export function pagination (searchParams) {
  const sortableValues = ['Name', 'Date']
  const sortableOrders = ['Asc', 'Desc']

  let size = 25
  if (searchParams.has('size')) {
    const parsedSize = parseInt(searchParams.get('size'))
    if (isNaN(parsedSize) || parsedSize <= 0 || parsedSize > 1000) {
      throw Object.assign(new Error('invalid page size'), { status: 400 })
    }
    size = parsedSize
  }

  let offset = 0
  let page = 1
  if (searchParams.has('page')) {
    const parsedPage = parseInt(searchParams.get('page'))
    if (isNaN(parsedPage) || parsedPage <= 0) {
      throw Object.assign(new Error('invalid page number'), { status: 400 })
    }
    offset = (parsedPage - 1) * size
    page = parsedPage
  }

  let before
  if (searchParams.has('before')) {
    const parsedBefore = new Date(searchParams.get('before'))
    if (isNaN(parsedBefore.getTime())) {
      throw Object.assign(new Error('invalid before date'), { status: 400 })
    }
    before = parsedBefore.toISOString()
  }

  let after
  if (searchParams.has('after')) {
    const parsedAfter = new Date(searchParams.get('after'))
    if (isNaN(parsedAfter.getTime())) {
      throw Object.assign(new Error('invalid after date'), { status: 400 })
    }
    after = parsedAfter.toISOString()
  }

  const sortBy = searchParams.get('sortBy') || 'Date'
  const sortOrder = searchParams.get('sortOrder') || 'Desc'

  if (!sortableOrders.includes(sortOrder)) {
    throw Object.assign(new Error(`Sort ordering by '${sortOrder}' is not supported. Supported sort orders are: [${sortableOrders.toString()}]`), { status: 400 })
  }

  if (!sortableValues.includes(sortBy)) {
    throw Object.assign(new Error(`Sorting by '${sortBy}' is not supported. Supported sort orders are: [${sortableValues.toString()}]`), { status: 400 })
  }

  return {
    page,
    size,
    offset,
    before,
    after,
    sortBy,
    sortOrder
  }
}
