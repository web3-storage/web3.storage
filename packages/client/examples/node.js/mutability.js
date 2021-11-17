import process from 'process'
import minimist from 'minimist'
import { Web3Storage, Name } from 'web3.storage'

async function main () {
  const args = minimist(process.argv.slice(2))
  const token = args.token

  if (!token) {
    console.error('A token is needed. You can create one on https://web3.storage')
    return
  }

  const client = new Web3Storage({ token, endpoint: args.endpoint })

  // Create a private key, and key ID (the "name" used to resolve the current value)
  const { id, privateKey } = await Name.keypair()

  console.log(`\n🆔 Created key ID:\n${id}\n`)

  // The value to publish
  const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'

  // Create a new name record for the given value
  const { record } = await Name.create(privateKey, null, value)
  console.log(`💿 Created new IPNS record /ipns/${id} => ${value}:\n${record}\n`)

  console.log('⏳ Publishing to Web3.Storage...')
  await Name.publish(client, id, record)
  console.log('✅ Done\n')

  console.log('⏳ Resolving current value...')
  const { value: curValue, record: curRecord } = await Name.resolve(client, id)
  console.log(`👉 Current value: ${curValue}\n`)

  // Update an existing record with a new value
  const updatedValue = '/ipfs/bafybeiauyddeo2axgargy56kwxirquxaxso3nobtjtjvoqu552oqciudrm'

  const { record: updatedRecord } = await Name.create(privateKey, curRecord, updatedValue)
  console.log(`💿 Created new IPNS record /ipns/${id} => ${updatedValue}:\n${updatedRecord}\n`)

  console.log('⏳ Publishing to Web3.Storage...')
  await Name.publish(client, id, updatedRecord)
  console.log('✅ Done\n')

  console.log('⏳ Resolving current value...')
  const { value: newCurValue } = await Name.resolve(client, id)
  console.log(`👉 Current value: ${newCurValue}\n`)
}

main()
