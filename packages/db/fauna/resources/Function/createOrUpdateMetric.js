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
  Now,
  Get
} = fauna

const name = 'createOrUpdateMetric'
const body = Query(
  Lambda(
    ['data'],
    Let(
      {
        updated: Select('updated', Var('data'), Now()),
        match: Match(
          Index('unique_Metric_key'),
          Select('key', Var('data'))
        )
      },
      If(
        IsEmpty(Var('match')),
        Create('Metric', {
          data: {
            key: Select('key', Var('data')),
            value: Select('value', Var('data')),
            updated: Var('updated')
          }
        }),
        Update(Select('ref', Get(Var('match'))), {
          data: {
            value: Select('value', Var('data')),
            updated: Var('updated')
          }
        })
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
