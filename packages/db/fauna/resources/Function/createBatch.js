import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Let,
  Select,
  Var,
  If,
  Create,
  Update,
  Exists,
  Collection,
  Foreach,
  Index,
  IsEmpty,
  Abort,
  Match,
  Do,
  Get
} = fauna

const name = 'createBatch'
const body = Query(
  Lambda(
    ['data'],
    Let(
      {
        batchCid: Select('batchCid', Var('data')),
        pieceCid: Select('pieceCid', Var('data')),
        batch: Create(
          Collection('Batch'),
          {
            data: {
              cid: Var('batchCid'),
              pieceCid: Var('pieceCid')
            }
          }
        ),
        batchRef: Select('ref', Var('batch')),
        entries: Select('entries', Var('data'))
      },
      Do(
        Foreach(
          Var('entries'),
          Lambda(
            'data',
            Let(
              {
                contentMatch: Match(Index('unique_Content_cid'), Select('cid', Var('data')))
              },
              If(
                IsEmpty(Var('contentMatch')),
                Abort('missing content CID'),
                Create(
                  Collection('BatchEntry'),
                  {
                    data: {
                      content: Select('ref', Get(Var('contentMatch'))),
                      batch: Var('batchRef'),
                      dataModelSelector: Select('dataModelSelector', Var('data'), null)
                    }
                  }
                )
              )
            )
          )
        ),
        Get(Var('batchRef'))
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
