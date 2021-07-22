import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Let,
  Match,
  Index,
  Select,
  Var,
  If,
  IsEmpty,
  Create,
  Update,
  Exists,
  Abort,
  Get,
  Now
} = fauna

const name = 'createOrUpdateDeal'
const body = Query(
  Lambda(
    ['data'],
    Let(
      {
        dealMatch: Match(
          Index('unique_Deal_dealId'),
          Select('dealId', Var('data'))
        )
      },
      If(
        IsEmpty(Var('dealMatch')),
        Let(
          {
            aggregateMatch: Match(
              Index('unique_Aggregate_dataCid'),
              Select('dataCid', Var('data'))
            ),
            aggregateRef: If(
              IsEmpty(Var('aggregateMatch')),
              Abort('aggregate not found'),
              Select('ref', Get(Var('aggregateMatch')))
            )
          },
          Create('Deal', {
            data: {
              aggregate: Var('aggregateRef'),
              storageProvider: Select('storageProvider', Var('data')),
              dealId: Select('dealId', Var('data')),
              activation: Select('activation', Var('data'), null),
              renewal: Select('renewal', Var('data'), null),
              status: Select('status', Var('data')),
              statusReason: Select('statusReason', Var('data'), null),
              created: Now(),
              updated: Now()
            }
          })
        ),
        Let(
          {
            deal: Get(Var('dealMatch')),
            currStorageProvider: Select(['data', 'storageProvider'], Var('deal')),
            currActivation: Select(['data', 'activation'], Var('deal'), null),
            currRenewal: Select(['data', 'renewal'], Var('deal'), null),
            currStatusReason: Select(['data', 'statusReason'], Var('deal'), null)
          },
          Update(Select('ref', Var('deal')), {
            data: {
              storageProvider: Select('storageProvider', Var('data'), Var('currStorageProvider')),
              activation: Select('activation', Var('data'), Var('currActivation')),
              renewal: Select('renewal', Var('data'), Var('currRenewal')),
              status: Select('status', Var('data')),
              statusReason: Select('statusReason', Var('data'), Var('currStatusReason')),
              updated: Now()
            }
          })
        )
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
