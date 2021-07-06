import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Let,
  Var,
  If,
  Update,
  Exists,
  Now,
  Ref,
  Abort,
  Collection,
  Get,
  Equals,
  Select
} = fauna

const name = 'deleteAuthToken'
const body = Query(
  Lambda(
    ['userId', 'authTokenId'],
    Let(
      { authTokenRef: Ref(Collection('AuthToken'), Var('authTokenId')) },
      If(
        // make sure the token exists
        Exists(Var('authTokenRef')),
        If(
          // make sure the user owns this token
          Equals(
            Select(['data', 'user', 'id'], Get(Var('authTokenRef'))),
            Var('userId')
          ),
          Update(Var('authTokenRef'), { data: { deleted: Now() } }),
          Abort('unauthorized')
        ),
        Abort('not found')
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
