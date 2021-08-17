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
  Paginate,
  Map,
  Get,
  Equals,
  Let,
  Range
} = fauna

const name = 'findPinsByStatusAndCreated'
const body = Query(
  Lambda(
    ['status', 'from', 'to', 'size', 'after', 'before'],
    Let(
      {
        range: Range(
          Match(Index('pin_by_status_sort_by_created_asc'), Var('status')),
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
        )
      },
      Map(Var('page'), Lambda(['created', 'ref'], Get(Var('ref'))))
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
