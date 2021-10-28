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
 * Match(Index('pinrequest_migration_timestamp'))
 */
const index = {
  name: 'pinrequest_migration_timestamp',
  source: Collection('PinRequest'),
  values: [
    { field: ['data', 'updated'] },
    { field: 'ref' }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)
