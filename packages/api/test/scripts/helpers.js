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
    privateKey: uint8arrays.toString(privKey.bytes, 'base64pad')
  }
}

/**
 * @param {string} privKey base64 encoded private key
 * @param {string} key "libp2p-key" encoding of the public key.
 * @param {string} value IPFS path
 * @param {bigint} seqno Sequence number
 */
export async function createNameRecord (privKey, key, value, seqno = 0n) {
  const privKeyBytes = uint8arrays.fromString(privKey, 'base64pad')
  const privKeyObj = await keys.unmarshalPrivateKey(privKeyBytes)
  const lifetime = 1000 * 60 * 60 // TODO: how long?
  const entry = await ipns.create(privKeyObj, uint8arrays.fromString(value), seqno, lifetime)
  return uint8arrays.toString(ipns.marshal(entry), 'base64pad')
}

export function getTestJWT (sub = 'test', name = 'test') {
  return JWT.sign({ sub, iss: JWT_ISSUER, iat: 1633957389872, name }, SALT)
}
