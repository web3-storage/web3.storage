import { CID } from 'multiformats'
import { Readable } from 'stream'

/**
 * Information about a user upload.
 */
export interface BackupCandidate {
  sourceCid: CID
  contentCid: CID
  authKeyId: string
  pinRequestId: string
  peer: string
}

/**
 * Information about a user upload paired with it's content.
 */
export interface BackupContent extends BackupCandidate {
  content: Readable,
}

/**
 * Information about a user upload paired with a URL it has been backed up to.
 */
export interface RemoteBackup extends BackupCandidate {
  backupUrl: URL
}
