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
 *   Index('batchEntry_by_batch_and_content'),
 *   Ref(Collection('Batch'), Var('batchId')),
 *   Ref(Collection('Content'), Var('contentId'))
 * )
 */
const index = {
  name: 'batchEntry_by_batch_and_content',
  source: Collection('BatchEntry'),
  terms: [
    { field: ['data', 'batch'] },
    { field: ['data', 'content'] }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)
