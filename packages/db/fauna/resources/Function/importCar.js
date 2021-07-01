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
  Merge,
  Now,
  Get,
  Ref,
  IsNonEmpty
} = fauna

const name = 'importCar'
const body = Query(
  Lambda(
    ['data'],
    Let(
      {
        authKeyRef: Ref(Collection('AuthKey'), Select('authKey', Var('data'))),
        cid: Select('cid', Var('data')),
        pinMatch: Match(Index('unique_Pin_cid'), Var('cid'))
      },
      If(
        Exists(Var('authKeyRef')),
        If(
          IsNonEmpty(Var('pinMatch')),
          Create('Upload', {
            data: {
              user: Select('user', Get(Var('authKeyRef'))),
              authKey: Var('authKeyRef'),
              cid: Var('cid'),
              pin: Ref(Collection('Pin'), Select('id', Get(Var('pinMatch')))),
              created: Now()
            }
          }),
          Let(
            {
              pin: Create('Pin', {
                data: {
                  cid: Var('cid'),
                  dagSize: Select('dagSize', Var('data'), 0),
                  created: Now()
                }
              }),
            },
            Create('Upload', {
              data: {
                user: Select('user', Get(Var('authKeyRef'))),
                authKey: Var('authKeyRef'),
                cid: Var('cid'),
                pin: Select('ref', Var('pin')),
                created: Now()
              }
            })
          )
        ),
        Abort('auth key not found')
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
