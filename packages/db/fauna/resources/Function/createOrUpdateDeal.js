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
  Collection,
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
          Index('unique_Deal_chainDealId'),
          Select('chainDealId', Var('data'))
        )
      },
      If(
        IsEmpty(Var('dealMatch')),
        Let(
          {
            batchMatch: Match(
              Index('unique_Batch_cid'),
              Select('batchCid', Var('data'))
            ),
            batchRef: If(
              IsEmpty(Var('batchMatch')),
              Abort('batch not found'),
              Select('ref', Get(Var('batchMatch')))
            )
          },
          Create(
            Collection('Deal'),
            {
              data: {
                batch: Var('batchRef'),
                miner: Select('miner', Var('data'), null),
                network: Select('network', Var('data'), null),
                chainDealId: Select('chainDealId', Var('data')),
                activation: Select('activation', Var('data'), null),
                renewal: Select('renewal', Var('data'), null),
                status: Select('status', Var('data')),
                statusReason: Select('statusReason', Var('data'), null),
                created: Now(),
                updated: Now()
              }
            }
          )
        ),
        Let(
          {
            deal: Get(Var('dealMatch'))
          },
          Update(
            Select('ref', Var('deal')),
            {
              data: {
                miner: Select('miner', Var('data'), Select(['data', 'miner'], Var('deal'), null)),
                network: Select('network', Var('data'), Select(['data', 'network'], Var('deal'), null)),
                activation: Select('activation', Var('data'), Select(['data', 'activation'], Var('deal'), null)),
                renewal: Select('renewal', Var('data'), Select(['data', 'renewal'], Var('deal'), null)),
                status: Select('status', Var('data')),
                statusReason: Select('statusReason', Var('data'), Select(['data', 'statusReason'], Var('deal'), null)),
                updated: Now()
              }
            }
          )
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
