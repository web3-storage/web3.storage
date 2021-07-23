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
 *   Index('aggregateEntry_by_aggregate_and_content'),
 *   Ref(Collection('Aggregate'), Var('aggregateId')),
 *   Ref(Collection('Content'), Var('contentId'))
 * )
 */
const index = {
  name: 'aggregateEntry_by_aggregate_and_content',
  source: Collection('AggregateEntry'),
  terms: [
    { field: ['data', 'aggregate'] },
    { field: ['data', 'content'] }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)
