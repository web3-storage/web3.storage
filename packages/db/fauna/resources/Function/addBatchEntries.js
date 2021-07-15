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
  Foreach,
  Index,
  IsEmpty,
  Abort,
  Match,
  Do,
  Get
} = fauna

const name = 'addBatchEntries'
const body = Query(
  Lambda(
    ['batchCid', 'entries'],
    Let(
      {
        batchMatch: Match(Index('unique_Batch_cid'), Var('batchCid')),
        batch: If(
          IsEmpty(Var('batchMatch')),
          Abort('batch not found'),
          Get(Var('batchMatch'))
        ),
        batchRef: Select('ref', Var('batch'))
      },
      Do(
        Foreach(
          Var('entries'),
          Lambda(
            'data',
            Let(
              {
                contentMatch: Match(Index('unique_Content_cid'), Select('cid', Var('data'))),
                content: If(
                  IsEmpty(Var('contentMatch')),
                  Abort('missing content CID'),
                  Get(Var('contentMatch'))
                ),
                entryMatch: Match(
                  Index('batchEntry_by_batch_and_content'),
                  Var('batchRef'),
                  Select('ref', Var('content'))
                )
              },
              If(
                IsEmpty(Var('entryMatch')),
                Create('BatchEntry', {
                  data: {
                    content: Select('ref', Var('content')),
                    batch: Var('batchRef'),
                    dataModelSelector: Select('dataModelSelector', Var('data'), null)
                  }
                }),
                null
              )
            )
          )
        ),
        Var('batch')
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
