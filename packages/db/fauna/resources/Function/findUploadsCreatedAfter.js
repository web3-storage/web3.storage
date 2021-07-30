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
  Map,
  Get,
  Equals,
  Let,
  Range,
  Match,
  Index
} = fauna

const name = 'findUploadsCreatedAfter'
const body = Query(
  Lambda(
    ['since', 'size', 'after', 'before'],
    Let(
      {
        range: Range(
          Match(Index('upload_inc_deleted_sort_by_created_asc')),
          Var('since'),
          null
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
