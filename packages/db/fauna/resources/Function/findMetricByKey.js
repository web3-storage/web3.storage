import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Match,
  Index,
  Var,
  Get,
  Exists,
  If,
  Update,
  Let,
  IsNonEmpty
} = fauna

const name = 'findMetricByKey'
const body = Query(
  Lambda(
    ['key'],
    Let(
      { match: Match(Index('unique_Metric_key'), Var('key')) },
      If(IsNonEmpty(Var('match')), Get(Var('match')), null)
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
