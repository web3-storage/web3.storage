/* eslint-env mocha, browser */
import assert from 'assert'
import { DBClient } from '../index.js'
import { normalizeCid } from '../../api/src/utils/cid.js'
import { createUser, createUserAuthKey, token } from './utils.js'

describe('user file list', () => {
  /** @type {DBClient} */
  const client = new DBClient({
    endpoint: 'http://127.0.0.1:3000',
    token,
    postgres: true
  })

  let user1, user2, authKey1, authKey2
  const initialBackupUrl = `https://backup.cid/${new Date().toISOString()}/${Math.random()}`
  const initialPinData = {
    status: 'Pinning',
    location: {
      peerId: 'peer_id',
      peerName: 'peer_name',
      ipfsPeerId: 'ipfs_peer_id',
      region: 'region'
    }
  }

  const cids = [
    'QmdA5WkDNALetBn4iFeSepHjdLGJdxPBwZyY47ir1bZGAK',
    'QmNvTjdqEPjZVWCvRWsFJA1vK7TTw1g9JP6we1WBJTRADM',
    'bafybeibvuy3vcepqxy4plr34twv22vvxol2jjhmjxcrcvuhea5226whpsm',
    'bafybeign5iv3opcs4hdlawuou4saeaynmpd4xabdhi3zrqluh5sxhc3zxu',
    'bafybeidn3ofhjaxt56ysmem4zmlqhkrqydrv5r5r3smn3piljkeu3ijh4y',
    'bafybeih7zshstbjjrkbzcqs2bvepo3aqp4c6vttm5oqx6jafqrmxc2eaay'
  ]
  const normalizedCids = cids.map(cid => normalizeCid(cid))
  const meta = { key: 'value' }
  const origins = ['origin1', 'origin2']
  const pinsPinning = [
    {
      status: 'Pinning',
      location: {
        peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6',
        peerName: 'web3-storage-sv15',
        ipfsPeerId: '12D3KooWR19qPPiZH4khepNjS3CLXiB7AbrbAD4ZcDjN1UjGUNE2',
        region: 'region'
      }
    }
  ]
  const pins = [
    {
      status: 'Pinning',
      location: {
        peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6',
        peerName: 'web3-storage-sv15',
        ipfsPeerId: '12D3KooWR19qPPiZH4khepNjS3CLXiB7AbrbAD4ZcDjN1UjGUNE2',
        region: 'region'
      }
    },
    {
      status: 'Pinned',
      location: {
        peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK7',
        peerName: 'web3-storage-sv16',
        ipfsPeerId: '12D3KooWR19qPPiZH4khepNjS3CLXiB7AbrbAD4ZcDjN1UjGUNE3',
        region: 'region'
      }
    },
    {
      status: 'Pinned',
      location: {
        peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK8',
        peerName: 'web3-storage-sv17',
        region: 'region'
      }
    },
    {
      status: 'Pinned',
      location: {
        peerId: '12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK9',
        peerName: 'web3-storage-sv18',
        region: 'region'
      }
    }
  ]

  beforeEach(async () => {
    user1 = await createUser(client)
    const keys = []
    authKey1 = await createUserAuthKey(client, parseInt(user1._id, 10))
    keys.push(authKey1)
    keys.push(await createUserAuthKey(client, parseInt(user1._id, 10)))
    user2 = await createUser(client)
    authKey2 = await createUserAuthKey(client, parseInt(user2._id, 10))

    // Uploads
    await Promise.all(cids.map((cid, idx) => {
      const key = keys[Math.floor(Math.random() * keys.length)]
      return client.createUpload({
        user: Number(user1._id),
        contentCid: cid,
        sourceCid: cid,
        authKey: Number(key),
        type: 'Upload',
        dagSize: 1000000,
        name: `Upload_${idx}`,
        pins: [],
        backupUrls: [initialBackupUrl]
      })
    }))
    await client.createUpload({
      user: Number(user2._id),
      contentCid: cids[0],
      sourceCid: cids[0],
      authKey: Number(authKey2),
      type: 'Upload',
      dagSize: 1000000,
      name: `Upload_${new Date().toISOString()}`,
      pins: [initialPinData],
      backupUrls: [initialBackupUrl]
    })

    // Pin requests
    await client.createPsaPinRequest({
      sourceCid: cids[1],
      contentCid: normalizedCids[1],
      dagSize: 2000000,
      name: 'PinRequest_1',
      meta,
      origins,
      pins,
      authKey: authKey1
    })
    // a pin request not yet pinned
    await client.createPsaPinRequest({
      sourceCid: cids[2],
      contentCid: normalizedCids[2],
      dagSize: 2000000,
      name: 'PinRequest_2',
      meta,
      origins,
      pins: pinsPinning,
      authKey: authKey1
    })
    await client.createPsaPinRequest({
      sourceCid: cids[3],
      contentCid: normalizedCids[3],
      dagSize: 2000000,
      name: 'PinRequest_3',
      meta,
      origins,
      pins,
      authKey: authKey1
    })
    await client.createPsaPinRequest({
      sourceCid: cids[1],
      contentCid: normalizedCids[1],
      dagSize: 2000000,
      name: 'PinRequest_4',
      meta,
      origins,
      pins,
      authKey: authKey2
    })

    // user1: 6 uploads, 2 pinned
  })

  it('should list uploaded and pinned', async () => {
    const userFiles = await client.listUserFiles(user1._id)
    assert(userFiles, 'user has files')
    assert.strictEqual(userFiles.length, 8, 'user file list includes uploads and pinned')
  })

  it('should limit the list', async () => {
    const userFiles = await client.listUserFiles(user1._id, {
      size: 4
    })
    assert(userFiles, 'user has files')
    assert.strictEqual(userFiles.length, 4, 'user file list is limited')
  })

  it('should sort the list', async () => {
    let userFiles = await client.listUserFiles(user1._id)
    assert(userFiles, 'user has files')
    assert.strictEqual(userFiles[0].name, 'PinRequest_3', 'default order is last created first')

    userFiles = await client.listUserFiles(user1._id, {
      sortBy: 'Name',
      sortOrder: 'Asc'
    })
    assert(userFiles, 'user has files')
    assert.strictEqual(userFiles[0].name, 'PinRequest_1', 'name order ascending')

    userFiles = await client.listUserFiles(user1._id, {
      sortBy: 'Name'
    })
    assert(userFiles, 'user has files')
    assert.strictEqual(userFiles[0].name, 'Upload_5', 'name order descending')
  })
})
