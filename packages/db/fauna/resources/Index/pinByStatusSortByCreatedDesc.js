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
 * Match(Index('pin_by_status_sort_by_created_desc'), "Pinning")
 */
const index = {
  name: 'pin_by_status_sort_by_created_desc',
  source: Collection('Pin'),
  terms: [
    { field: ['data', 'status'] }
  ],
  values: [
    { field: ['data', 'created'], reverse: true },
    { field: 'ref' }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)
