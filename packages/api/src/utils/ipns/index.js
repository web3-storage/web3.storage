import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import { PreciseDate } from '@google-cloud/precise-date'
import { decode as decodeCbor } from 'cborg'
import { IpnsEntry } from './pb/ipns.js'
import { errCode } from '../err-code.js'

const ERROR_IPNS_EXPIRED_RECORD = 'ERROR_IPNS_EXPIRED_RECORD'
const ERROR_UNRECOGNIZED_VALIDITY = 'ERROR_UNRECOGNIZED_VALIDITY'
const ERROR_SIGNATURE_VERIFICATION = 'ERROR_SIGNATURE_VERIFICATION'
const ERROR_UNRECOGNIZED_FORMAT = 'ERROR_UNRECOGNIZED_FORMAT'
const ERROR_INVALID_RECORD_DATA = 'ERROR_INVALID_RECORD_DATA'

export function unmarshal (buf) {
  const message = IpnsEntry.decode(buf)
  const object = IpnsEntry.toObject(message, {
    defaults: false,
    arrays: true,
    objects: false
  })
  return {
    value: object.value,
    signature: object.signature,
    validityType: object.validityType,
    validity: object.validity,
    sequence: Object.hasOwnProperty.call(object, 'sequence') ? BigInt(`${object.sequence}`) : 0,
    pubKey: object.pubKey,
    ttl: Object.hasOwnProperty.call(object, 'ttl') ? BigInt(`${object.ttl}`) : undefined,
    signatureV2: object.signatureV2,
    data: object.data
  }
}

export async function validate (publicKey, entry) {
  const { value, validityType, validity } = entry
  let dataForSignature
  let signature
  if (entry.signatureV2 && entry.data) {
    signature = entry.signatureV2
    dataForSignature = ipnsEntryDataForV2Sig(entry.data)
    validateCborDataMatchesPbData(entry)
  } else {
    signature = entry.signature
    dataForSignature = ipnsEntryDataForV1Sig(value, validityType, validity)
  }
  let isValid
  try {
    isValid = await publicKey.verify(dataForSignature, signature)
  } catch (err) {
    isValid = false
  }
  if (!isValid) {
    throw errCode(new Error('record signature verification failed'), ERROR_SIGNATURE_VERIFICATION)
  }
  if (validityType === IpnsEntry.ValidityType.EOL) {
    const validityDate = new PreciseDate(uint8ArrayToString(validity))
    if (isNaN(validityDate.getTime())) {
      throw errCode(new Error('unrecognized validity format (not an rfc3339 format)'), ERROR_UNRECOGNIZED_FORMAT)
    }
    if (validityDate.getFullTime() < new PreciseDate().getFullTime()) {
      throw errCode(new Error('record has expired'), ERROR_IPNS_EXPIRED_RECORD)
    }
  } else if (validityType) {
    throw errCode(new Error('unrecognized validity type'), ERROR_UNRECOGNIZED_VALIDITY)
  }
}

function ipnsEntryDataForV2Sig (data) {
  const entryData = uint8ArrayFromString('ipns-signature:')
  return uint8ArrayConcat([
    entryData,
    data
  ])
}

function ipnsEntryDataForV1Sig (value, validityType, validity) {
  const validityTypeBuffer = uint8ArrayFromString(getValidityType(validityType))
  return uint8ArrayConcat([
    value,
    validity,
    validityTypeBuffer
  ])
}

function getValidityType (validityType) {
  if (validityType.toString() === '0') return 'EOL'
  throw errCode(new Error(`unrecognized validity type: ${validityType.toString()}`), 'ERROR_UNRECOGNIZED_VALIDITY')
}

const validateCborDataMatchesPbData = entry => {
  if (!entry.data) {
    throw errCode(new Error('Record data is missing'), ERROR_INVALID_RECORD_DATA)
  }
  const data = decodeCbor(entry.data)
  if (Number.isInteger(data.Sequence)) {
    data.Sequence = BigInt(data.Sequence)
  }
  if (Number.isInteger(data.TTL)) {
    data.TTL = BigInt(data.TTL)
  }
  if (!uint8ArrayEquals(data.Value, entry.value)) {
    throw errCode(new Error('Ffield "value" did not match between protobuf and CBOR'), ERROR_SIGNATURE_VERIFICATION)
  }
  if (!uint8ArrayEquals(data.Validity, entry.validity)) {
    throw errCode(new Error('field "validity" did not match between protobuf and CBOR'), ERROR_SIGNATURE_VERIFICATION)
  }
  if (data.ValidityType !== entry.validityType) {
    throw errCode(new Error('field "validityType" did not match between protobuf and CBOR'), ERROR_SIGNATURE_VERIFICATION)
  }
  if (data.Sequence !== entry.sequence) {
    throw errCode(new Error('field "sequence" did not match between protobuf and CBOR'), ERROR_SIGNATURE_VERIFICATION)
  }
  if (data.TTL !== entry.ttl) {
    throw errCode(new Error('field "ttl" did not match between protobuf and CBOR'), ERROR_SIGNATURE_VERIFICATION)
  }
}
