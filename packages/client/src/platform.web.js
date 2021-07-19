// TODO: Use indexedDb
import { MemoryBlockStore } from 'ipfs-car/blockstore/memory'

export const fetch = globalThis.fetch
export const Request = globalThis.Request
export const Response = globalThis.Response
export const Blob = globalThis.Blob
export const File = globalThis.File
export const Blockstore = MemoryBlockStore
// @ts-ignore filesFromPath any type
export const filesFromPath = undefined
// @ts-ignore getFilesFromPath any type
export const getFilesFromPath = undefined
