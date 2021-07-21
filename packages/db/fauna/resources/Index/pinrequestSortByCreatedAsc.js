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
 *  Paginate(Match(Index("pinrequest_sort_by_created_asc"))),
 *  Lambda(["created", "pinRequestRef"], Get(Var("pinRequestRef")))
 * )
 */
const index = {
  name: 'pinrequest_sort_by_created_asc',
  source: Collection('PinRequest'),
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
