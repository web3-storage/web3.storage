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
 * Match(Index('user_sort_by_created_asc'))
 */
const index = {
  name: 'user_sort_by_created_asc',
  source: Collection('User'),
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
