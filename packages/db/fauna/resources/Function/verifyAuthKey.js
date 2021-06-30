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
  IsNonEmpty,
  Filter,
  Equals,
  Select
} = fauna

const name = 'verifyAuthKey'
const body = Query(
  Lambda(
    ["issuer", "secret"],
    Let(
      { userMatch: Match(Index("unique_User_issuer"), Var("issuer")) },
      If(
        IsNonEmpty(Var("userMatch")),
        Let(
          {
            user: Get(Var("userMatch")),
            keyMatch: Match(Index("authKey_user_by_user"), Select("_id", Var("user")))
          },
          If(
            IsNonEmpty(Var("keyMatch")),
            Let(
              {
                filterKeyMatch: Filter(Var("keyMatch"), Lambda(
                  "authKey",
                  Equals(Select("secret", Var("authKey")), Var("secret"))
                ))
              },
              If(
                IsNonEmpty(Var('filterKeyMatch')),
                Get(Var('filterKeyMatch')),
                null
              )
            ),
            null
          )
        ),
        null
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
