import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Var,
  Exists,
  If,
  Update,
  Paginate,
  Equals,
  Let,
  Map,
  Match,
  Index,
  Sum,
  Select,
  Get,
  Range
} = fauna

const name = 'sumPinDagSize'
const body = Query(
  Lambda(
    ['from', 'to', 'size', 'after', 'before'],
    Let(
      {
        range: Range(
          Match(Index('pin_content_by_status_sort_by_created_asc'), 'Pinned'),
          Var('from'),
          Var('to')
        ),
        page: If(
          Equals(Var('before'), null),
          If(
            Equals(Var('after'), null),
            Paginate(Var('range'), { size: Var('size') }),
            Paginate(Var('range'), { size: Var('size'), after: Var('after') })
          ),
          Paginate(Var('range'), { size: Var('size'), before: Var('before') })
        ),
        sizes: Map(
          Var('page'),
          Lambda(
            ['created', 'content'],
            Select(['data', 'dagSize'], Get(Var('content')), 0)
          )
        )
      },
      {
        data: [Sum(Select('data', Var('sizes')))],
        after: Select('after', Var('page'), null),
        before: Select('before', Var('page'), null)
      }
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
