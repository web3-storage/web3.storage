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
  Get
} = fauna

const name = 'sumPinDagSize'
const body = Query(
  Lambda(
    ['from', 'to', 'size', 'after', 'before'],
    Let(
      {
        match: Match(Index('pin_content_by_status_sort_by_created_asc'), 'Pinned'),
        page: If(
          Equals(Var('before'), null),
          If(
            Equals(Var('after'), null),
            Paginate(Var('match'), { size: Var('size') }),
            Paginate(Var('match'), { size: Var('size'), after: Var('after') })
          ),
          Paginate(Var('match'), { size: Var('size'), before: Var('before') })
        ),
        sizes: Map(
          Var('page'),
          Lambda(
            ['created', 'content'],
            Select(['data', 'dagSize'], Get(Var('content')), 0)
          )
        )
      },
      Sum(Select('data', Var('sizes')))
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
