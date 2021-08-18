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
 * Map(
 *  Paginate(Match(Index("pinSyncRequest_sort_by_created_asc"))),
 *  Lambda(["created", "pinSyncRequestRef"], Get(Var("pinSyncRequestRef")))
 * )
 */
const index = {
  name: 'pinSyncRequest_sort_by_created_asc',
  source: Collection('PinSyncRequest'),
  values: [
    { field: ['data', 'created'] },
    { field: ['ref'] }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)
