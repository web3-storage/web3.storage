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
  Match
} = fauna

/**
 * Creates a new pin object and either refs an existing location or creates it.
 */
const name = 'createPinAndLocation'
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
            )
          },
          Create('Pin', {
            data: {
              content: Var('contentRef'),
              location: Select('ref', Var('loc')),
              status: Var('status'),
              updated: Now()
            }
          })
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
