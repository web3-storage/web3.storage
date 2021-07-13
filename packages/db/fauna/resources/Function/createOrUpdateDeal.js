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
          Create('Deal', {
            data: {
              batch: Var('batchRef'),
              miner: Select('miner', Var('data')),
              chainDealId: Select('chainDealId', Var('data')),
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
            currMiner: Select(['data', 'miner'], Var('deal')),
            currActivation: Select(['data', 'activation'], Var('deal'), null),
            currRenewal: Select(['data', 'renewal'], Var('deal'), null),
            currStatusReason: Select(['data', 'statusReason'], Var('deal'), null)
          },
          Update(Select('ref', Var('deal')), {
            data: {
              miner: Select('miner', Var('data'), Var('currMiner')),
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
