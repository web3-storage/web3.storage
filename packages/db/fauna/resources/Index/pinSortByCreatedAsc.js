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
 * Match(Index('pin_sort_by_created_asc'))
 */
const index = {
  name: 'pin_sort_by_created_asc',
  source: Collection('Pin'),
  values: [
    { field: ['data', 'created'] },
    { field: 'ref' }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)
