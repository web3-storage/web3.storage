import fauna from 'faunadb'

const {
  CreateIndex,
  Collection,
  If,
  Index,
  Exists,
  Not,
  Query,
  Lambda,
  Equals,
  Select,
  Var
} = fauna

/**
 * Usage:
 *
 * Match(
 *   Index('upload_sort_by_created_asc'),
 *   true // not_deleted
 * )
 */
const index = {
  name: 'upload_sort_by_created_asc',
  source: [{
    collection: Collection('Upload'),
    fields: {
      not_deleted: Query(
        Lambda(
          'upload',
          Equals(Select(['data', 'deleted'], Var('upload'), null), null)
        )
      )
    }
  }],
  terms: [
    { binding: 'not_deleted' }
  ],
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
