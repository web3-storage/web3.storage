import fromPath from 'files-from-path'
import { MemoryBlockStore } from 'ipfs-car/blockstore/memory'

export const fetch = globalThis.fetch
export const Blob = globalThis.Blob
export const File = globalThis.File
export const Blockstore = MemoryBlockStore
export const filesFromPath = fromPath.filesFromPath
export const getFilesFromPath = fromPath.getFilesFromPath