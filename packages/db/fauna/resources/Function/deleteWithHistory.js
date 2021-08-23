import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Let,
  Var,
  If,
  Do,
  Update,
  Exists,
  Paginate,
  Events,
  IsNull,
  Delete,
  Get,
  Foreach,
  Remove,
  Select
} = fauna

const name = 'deleteWithHistory'
const body = Query(
  Lambda(
    ['ref'],
    Let(
      {
        events: Paginate(Events(Var('ref'))),
        after: Select(['after'], Var('events'), null),
        result: If(IsNull(Var('after')), Get(Var('ref')), Delete(Var('ref')))
      },
      Do(
        Foreach(
          Var('events'),
          Lambda(
            'event',
            Let(
              {
                ts: Select(['ts'], Var('event')),
                action: Select(['action'], Var('event'))
              },
              Remove(Var('ref'), Var('ts'), Var('action'))
            )
          )
        ),
        Var('result')
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
