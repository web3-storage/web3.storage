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
  Get,
  And,
  Not,
  IsNull,
  GT
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
        // Create each entry in the DB if not exists.
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
                dagSize: Select('dagSize', Var('data'), null),
                entryMatch: Match(
                  Index('aggregateEntry_by_aggregate_and_content'),
                  Var('aggregateRef'),
                  Select('ref', Var('content'))
                )
              },
              Do(
                // Update content dagSize if this was provided and not already set.
                If(
                  And(
                    Not(IsNull(Var('dagSize'))),
                    GT(Var('dagSize'), 0),
                    IsNull(Select(['data', 'dagSize'], Var('content'), null))
                  ),
                  Update(
                    Select('ref', Var('content')),
                    { data: { dagSize: Var('dagSize') } }
                  ),
                  null
                ),
                // Create the aggregate entry.
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
