import yaml from 'yaml'
import fs from 'fs/promises'
import path from 'path'

const BASE_DOCS_PATH = 'content/docs'

/**
 * @typedef {import('./markdown').SerializeMDXResult} SerializeMDXResult
 * 
 * @typedef {object} Doc
 * @property {string} content - raw file content
 * @property {string} docId - url path to doc, without leading '/docs' prefix. e.g. `/concepts/content-addressing`
 * @property {string} path - full url path to doc, e.g. `/docs/${docId}`
 * @property {string} localPath - local path to original file
 * @property {SerializeMDXResult} [compiled]
 */

/**
 * Loads a markdown doc from the local filesystem.
 * 
 * @param {string} docPath local filepath to markdown doc, relative to BASE_DOCS_PATH
 * @returns {Promise<Doc>}
 */
export async function loadDoc(docPath) {
  const content = await fs.readFile(docPath, 'utf-8')
  const name = docPath.replace(BASE_DOCS_PATH, '').replace(/\/README.mdx?$/, '')
  const docId = name.replace(/\.mdx?$/, '')
  const pagePath = '/docs' + docId
  return { content, docId, path: pagePath, localPath: docPath }
}

/**
 * Loads a markdown doc by searching for a file matching the given docId.
 * 
 * @param {string} docId 
 * @returns {Promise<Doc>}
 */
export async function loadDocById(docId) {
  const candidates = [`${docId}.md`, `${docId}.mdx`, `${docId}/README.md`]
  for (const filename of candidates) {
    const localPath = path.join(BASE_DOCS_PATH, filename)
    try {
      await fs.access(localPath)
      return loadDoc(localPath)
    } catch (e) {
    }
  }
  throw new Error(`no doc found with id ${docId}`)
}

/**
 * Loads the URL paths for all docs by walking the filesystem.
 * @returns {Promise<string[]>}
 */
export async function loadDocsPaths() {
  const paths = []
  for await (const entry of walk(BASE_DOCS_PATH)) {
    if (!entry.match(/\.mdx?$/)) {
      continue
    }
    const docId = docIdFromLocalPath(entry)
    paths.push(sitePathFromDocId(docId))
  }
  return paths
}

/**
 * 
 * @param {string} filePath 
 * @returns {string}
 */
function docIdFromLocalPath(filePath) {
  const name = filePath.replace(BASE_DOCS_PATH, '').replace(/\/README.mdx?$/, '')
  return name.replace(/\.mdx?$/, '')
}

/**
 * @param {string} docId 
 * @returns {string}
 */
function sitePathFromDocId(docId) {
  return path.join('/docs', docId)
} 

/**
 * Walks the directory recursively, yielding the path to each file inside.
 * @param {string} dir path to directory
 * @returns {AsyncGenerator<string>}
 */
async function* walk(dir) {
  for await (const d of await fs.opendir(dir)) {
      const entry = path.join(dir, d.name);
      if (d.isDirectory()) {
        yield* walk(entry)
      }
      else if (d.isFile()) {
        yield entry
      }
  }
}

/**
 * 
 * @typedef {object} SidebarDefinition
 * @property {SidebarItem[]} items
 * 
 * @typedef {object} SidebarItem
 * @property {string} title
 * @property {string} [path]
 * @property {SidebarItem[]} [items]
 * 
 * @returns {Promise<SidebarDefinition>}
 */
export async function loadSidebarDefinition() {
  const filename = path.join(BASE_DOCS_PATH, 'sidebar.yaml')
  const content = await fs.readFile(filename, 'utf-8')
  return yaml.parse(content)
}