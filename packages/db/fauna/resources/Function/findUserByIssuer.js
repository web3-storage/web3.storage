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

const name = 'findUserByIssuer'
const body = Query(
  Lambda(
    ['issuer'],
    Let(
      { match: Match(Index('unique_User_issuer'), Var('issuer')) },
      If(IsNonEmpty(Var('match')), Get(Var('match')), null)
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
