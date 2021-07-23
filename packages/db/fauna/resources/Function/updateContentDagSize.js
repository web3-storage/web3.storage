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
  Ref,
  Abort,
  Collection,
  Not
} = fauna

const name = 'updateContentDagSize'
const body = Query(
  Lambda(
    ['id', 'dagSize'],
    Let(
      { contentRef: Ref(Collection('Content'), Var('id')) },
      If(
        Not(Exists(Var('contentRef'))),
        Abort('content not found'),
        Update(Var('contentRef'), { data: { dagSize: Var('dagSize') } })
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
