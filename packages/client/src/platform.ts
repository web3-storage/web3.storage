import { MemoryBlockStore } from 'ipfs-car/blockstore/memory'

export const fetch = globalThis.fetch
export const Blob = globalThis.Blob
export const File = globalThis.File
export const Blockstore = MemoryBlockStore
