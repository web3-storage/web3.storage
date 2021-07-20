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

const name = 'addAggregateEntries'
const body = Query(
  Lambda(
    ['dataCid', 'entries'],
    Let(
      {
        aggregateMatch: Match(Index('unique_Aggregate_dataCid'), Var('dataCid')),
        aggregate: If(
          IsEmpty(Var('aggregateMatch')),
          Abort('aggregate not found'),
          Get(Var('aggregateMatch'))
        ),
        aggregateRef: Select('ref', Var('aggregate'))
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
                  Index('aggregateEntry_by_aggregate_and_content'),
                  Var('aggregateRef'),
                  Select('ref', Var('content'))
                )
              },
              If(
                IsEmpty(Var('entryMatch')),
                Create('AggregateEntry', {
                  data: {
                    content: Select('ref', Var('content')),
                    aggregate: Var('aggregateRef'),
                    dataModelSelector: Select('dataModelSelector', Var('data'), null)
                  }
                }),
                null
              )
            )
          )
        ),
        Var('aggregate')
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
