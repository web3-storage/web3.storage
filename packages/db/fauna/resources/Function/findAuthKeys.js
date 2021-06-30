import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Match,
  Index,
  Var,
  Exists,
  If,
  Update,
  Let,
  IsNonEmpty
} = fauna

const name = 'findAuthKeys'
const body = Query(
  Lambda(
    ["user"],
    Let(
      { match: Match(Index("authKey_user_by_user"), Var("user")) },
      If(
        IsNonEmpty(Var("match")),
        Var("match"),
        []
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
