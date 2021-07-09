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
 *   Index('deal_by_batch'),
 *   Ref(Collection('batch'), Var('id'))
 * )
 */
const index = {
  name: 'deal_by_batch',
  source: Collection('Deal'),
  terms: [
    { field: ['data', 'batch'] }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)
