import process from 'process'
import minimist from 'minimist'
import { Web3Storage } from 'web3.storage'
import * as Name from 'web3.storage/name'

async function main () {
  const args = minimist(process.argv.slice(2))
  const token = args.token

  if (!token) {
    console.error('A token is needed. You can create one on https://web3.storage')
    return
  }

  const client = new Web3Storage({ token, endpoint: args.endpoint })
  const name = await Name.create()

  console.log(`\n🆔 Created name:\n${name}\n`)

  // The value to publish
  const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'

  // Create a new revision for the given value
  const revision = await Name.v0(name, value)
  console.log(`💿 Created new IPNS record revision /ipns/${name} => ${revision.value} (seqno ${revision.sequence})`)

  console.log('⏳ Publishing to Web3.Storage...')
  await Name.publish(client, revision, name.key)
  console.log('✅ Done\n')

  console.log('⏳ Resolving current value...')
  const curRevision = await Name.resolve(client, name)
  console.log(`👉 Current value: ${curRevision.value}\n`)

  // Make a revision to our name points to a new value
  const nextValue = '/ipfs/bafybeiauyddeo2axgargy56kwxirquxaxso3nobtjtjvoqu552oqciudrm'
  const nextRevision = await Name.increment(revision, nextValue)
  console.log(`💿 Created new IPNS record revision /ipns/${name} => ${nextRevision.value} (seqno ${nextRevision.sequence})`)

  console.log('⏳ Publishing to Web3.Storage...')
  await Name.publish(client, nextRevision, name.key)
  console.log('✅ Done\n')

  console.log('⏳ Resolving current value...')
  const newCurRevision = await Name.resolve(client, name)
  console.log(`👉 Current value: ${newCurRevision.value}\n`)
}

main()
