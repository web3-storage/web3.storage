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
 * Match(Index('pinSyncRequest_migration_timestamp'))
 */
const index = {
  name: 'pinSyncRequest_migration_timestamp',
  source: Collection('PinSyncRequest'),
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
