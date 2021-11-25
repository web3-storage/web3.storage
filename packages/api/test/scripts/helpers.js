import * as uint8arrays from 'uint8arrays'
import * as ipns from 'ipns'
import * as Digest from 'multiformats/hashes/digest'
import { identity } from 'multiformats/hashes/identity'
import { base36 } from 'multiformats/bases/base36'
import { CID } from 'multiformats/cid'
import { keys } from 'libp2p-crypto'
import * as JWT from '../../src/utils/jwt.js'
import { JWT_ISSUER } from '../../src/constants.js'
import { SALT } from './worker-globals.js'

const libp2pKeyCode = 0x72

export async function createNameKeypair () {
  const privKey = await keys.generateKeyPair('Ed25519', 2048)
  const digest = Digest.create(identity.code, privKey.public.bytes)
  return {
    id: CID.createV1(libp2pKeyCode, digest).toString(base36),
    privateKey: privKey.bytes
  }
}

/**
 * @param {Uint8Array} privKey base64 encoded private key
 * @param {string} value IPFS path
 * @param {bigint} seqno Sequence number
 */
export async function createNameRecord (privKey, value, seqno = 0n) {
  const privKeyObj = await keys.unmarshalPrivateKey(privKey)
  const lifetime = 1000 * 60 * 60
  const entry = await ipns.create(privKeyObj, uint8arrays.fromString(value), seqno, lifetime)
  return ipns.marshal(entry)
}

export function getTestJWT (sub = 'test', name = 'test') {
  return JWT.sign({ sub, iss: JWT_ISSUER, iat: 1633957389872, name }, SALT)
}
