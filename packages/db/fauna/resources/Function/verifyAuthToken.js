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
  Select,
  And
} = fauna

const name = 'verifyAuthToken'
const body = Query(
  Lambda(
    ['issuer', 'secret'],
    Let(
      { userMatch: Match(Index('unique_User_issuer'), Var('issuer')) },
      If(
        IsNonEmpty(Var('userMatch')),
        Let(
          {
            user: Get(Var('userMatch')),
            keyMatch: Match(
              Index('authToken_user_by_user'),
              Select('ref', Var('user'))
            )
          },
          If(
            IsNonEmpty(Var('keyMatch')),
            Let(
              {
                filterKeyMatch: Filter(
                  Var('keyMatch'),
                  Lambda(
                    'authTokenRef',
                    Let(
                      { authToken: Get(Var('authTokenRef')) },
                      And(
                        Equals(Select(['data', 'secret'], Var('authToken')), Var('secret')),
                        Equals(Select(['data', 'deleted'], Var('authToken'), null), null)
                      )
                    )
                  )
                )
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
