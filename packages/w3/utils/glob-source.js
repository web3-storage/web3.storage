import Path from 'path'
import { promises as fsp } from 'fs'
import fs from 'fs'
import glob from 'it-glob'
import errCode from 'err-code'

// ported to esm from https://github.com/ipfs/js-ipfs-utils/blob/d7e7bde061ef928d72f34c17d4d6310a7215bd73/src/files/glob-source.js
// converts path -> name and content -> stream to fit the web3.storage expectation

/**
 * Create an async iterator that yields paths that match requested file paths.
 *
 * @param {Iterable<string> | AsyncIterable<string> | string} paths - File system path(s) to glob from
 * @param {Object} [options] - Optional options
 * @param {boolean} [options.hidden] - Include .dot files in matched paths
 * @param {Array<string>} [options.ignore] - Glob paths to ignore
 * @param {boolean} [options.followSymlinks] - follow symlinks
 * @param {boolean} [options.preserveMode] - preserve mode
 * @param {boolean} [options.preserveMtime] - preserve mtime
 * @param {number} [options.mode] - mode to use - if preserveMode is true this will be ignored
 * @param {import('ipfs-unixfs').MtimeLike} [options.mtime] - mtime to use - if preserveMtime is true this will be ignored
 * @yields {Object} File objects in the form `{ name: String, stream: AsyncIterator<Buffer> }`
 */
export async function * globSource (paths, options) {
  options = options || {}

  if (typeof paths === 'string') {
    paths = [paths]
  }

  const globSourceOptions = {
    recursive: true,
    glob: {
      dot: Boolean(options.hidden),
      ignore: Array.isArray(options.ignore) ? options.ignore : [],
      follow: options.followSymlinks != null ? options.followSymlinks : true
    }
  }

  // Check the input paths comply with options.recursive and convert to glob sources
  for await (const path of paths) {
    if (typeof path !== 'string') {
      throw errCode(
        new Error('Path must be a string'),
        'ERR_INVALID_PATH',
        { path }
      )
    }

    const absolutePath = Path.resolve(process.cwd(), path)
    const stat = await fsp.stat(absolutePath)
    const prefix = Path.dirname(absolutePath)

    let mode = options.mode

    if (options.preserveMode) {
      // @ts-ignore
      mode = stat.mode
    }

    let mtime = options.mtime

    if (options.preserveMtime) {
      // @ts-ignore
      mtime = stat.mtime
    }

    yield * toGlobSource({
      path,
      type: stat.isDirectory() ? 'dir' : 'file',
      prefix,
      mode,
      mtime,
      preserveMode: options.preserveMode,
      preserveMtime: options.preserveMtime
    }, globSourceOptions)
  }
}

// @ts-ignore
async function * toGlobSource ({ path, type, prefix, mode, mtime, preserveMode, preserveMtime }, options) {
  options = options || {}

  const baseName = Path.basename(path)

  if (type === 'file') {
    yield {
      name: `${baseName.replace(prefix, '')}`,
      stream: () => fs.createReadStream(Path.isAbsolute(path) ? path : Path.join(process.cwd(), path)),
      mode,
      mtime
    }

    return
  }

  const globOptions = Object.assign({}, options.glob, {
    cwd: path,
    nodir: false,
    realpath: false,
    absolute: true
  })

  for await (const p of glob(path, '**/*', globOptions)) {
    const stat = await fsp.stat(p)

    if (!stat.isFile()) {
      // skip dirs.
      continue
    }

    if (preserveMode || preserveMtime) {
      if (preserveMode) {
        mode = stat.mode
      }

      if (preserveMtime) {
        mtime = stat.mtime
      }
    }

    yield {
      name: toPosix(p.replace(prefix, '')),
      stream: () => fs.createReadStream(p),
      mode,
      mtime
    }
  }
}

/**
 * @param {string} path
 */
const toPosix = path => path.replace(/\\/g, '/')