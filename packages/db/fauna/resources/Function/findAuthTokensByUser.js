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
  Map,
  Paginate,
  Let,
  Equals,
  Ref,
  Collection,
  Filter,
  Select
} = fauna

const name = 'findAuthTokensByUser'
const body = Query(
  Lambda(
    ['user', 'size', 'after', 'before'],
    Let(
      {
        match: Filter(
          Match(Index('authToken_user_by_user'), Ref(Collection('User'), Var('user'))),
          Lambda(
            'authTokenRef',
            Equals(Select(['data', 'deleted'], Get(Var('authTokenRef')), null), null)
          )
        ),
        page: If(
          Equals(Var('before'), null),
          If(
            Equals(Var('after'), null),
            Paginate(Var('match'), { size: Var('size') }),
            Paginate(Var('match'), { size: Var('size'), after: Var('after') })
          ),
          Paginate(Var('match'), { size: Var('size'), before: Var('before') })
        )
      },
      Map(Var('page'), Lambda('authTokenRef', Get(Var('authTokenRef'))))
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
