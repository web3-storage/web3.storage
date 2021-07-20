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
  Ref,
  Abort,
  Collection,
  Not,
  Index,
  IsEmpty,
  Get,
  Match,
  IsNull,
  Equals
} = fauna

const name = 'createOrUpdatePin'
const body = Query(
  Lambda(
    ['data'],
    Let(
      {
        contentRef: Ref(Collection('Content'), Select('content', Var('data'))),
        status: Select('status', Var('data')),
        peerId: Select(['location', 'peerId'], Var('data')),
        peerName: Select(['location', 'peerName'], Var('data'), null),
        region: Select(['location', 'region'], Var('data'), null)
      },
      If(
        Not(Exists(Var('contentRef'))),
        Abort('content not found'),
        Let(
          {
            locMatch: Match(Index('unique_PinLocation_peerId'), Var('peerId')),
            loc: If(
              IsEmpty(Var('locMatch')),
              Create('PinLocation', {
                data: {
                  content: Var('contentRef'),
                  peerId: Var('peerId'),
                  peerName: Var('peerName'),
                  region: Var('region')
                }
              }),
              Get(Var('locMatch'))
            ),
            pinsMatch: Match(
              Index('pin_by_content_and_location'),
              Var('contentRef'),
              Select('ref', Var('loc'))
            ),
            pin: If(IsEmpty(Var('pinsMatch')), null, Get(Var('pinsMatch')))
          },
          If(
            IsNull(Var('pin')),
            Create('Pin', {
              data: {
                content: Var('contentRef'),
                location: Select('ref', Var('loc')),
                status: Var('status'),
                updated: Now(),
                created: Now()
              }
            }),
            If(
              Equals(Select(['data', 'status'], Var('pin')), Var('status')),
              Var('pin'),
              Update(Select('ref', Get(Var('pinsMatch'))), {
                data: {
                  status: Var('status'),
                  updated: Now()
                }
              })
            )
          )
        )
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)
