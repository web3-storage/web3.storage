import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Let,
  Select,
  Var,
  If,
  Create,
  Update,
  Exists,
  Now,
  Abort,
  Index,
  IsEmpty,
  Get,
  Match,
  IsNull,
  Call
} = fauna

const name = 'createPinRequest'
const body = Query(
  Lambda(
    ['data'],
    Let(
      {
        cid: Select('cid', Var('data')),
        content: Call('findContentByCid', Var('cid')),
        contentRef: If(
          IsNull(Var('content')),
          Abort('content not found'),
          Select('ref', Var('content'))
        ),
        attempts: Select('attempts', Var('data'), null),
        pinRequestMatch: Match(
          Index('unique_PinRequest_cid'),
          Var('cid')
        ),
        pinRequest: If(IsEmpty(Var('pinRequestMatch')), null, Get(Var('pinRequestMatch')))
      },
      If(
        IsNull(Var('pinRequest')),
        Create('PinRequest', {
          data: {
            cid: Var('cid'),
            content: Var('contentRef'),
            attempts: 0,
            updated: Now(),
            created: Now()
          }
        }),
        Var('pinRequest')
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
