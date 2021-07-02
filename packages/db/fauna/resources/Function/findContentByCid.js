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

const name = 'findContentByCid'
const body = Query(
  Lambda(
    ['cid'],
    Let(
      { match: Match(Index('unique_Content_cid'), Var('cid')) },
      If(IsNonEmpty(Var('match')), Get(Var('match')), null)
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
