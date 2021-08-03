import fauna from 'faunadb'

const {
  CreateIndex,
  Collection,
  If,
  Index,
  Exists,
  Not
} = fauna

/**
 * Usage:
 *
 * Match(
 *   Index('pin_content_by_status_sort_by_created_asc'),
 *   StatusString // Pinned, Pinning, PinQueued, ...
 * )
 */
const index = {
  name: 'pin_content_by_status_sort_by_created_asc',
  source: Collection('Pin'),
  terms: [
    { field: ['data', 'status'] }
  ],
  values: [
    { field: ['data', 'created'] },
    { field: ['data', 'content'] }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)
