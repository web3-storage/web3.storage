/* eslint-disable react/no-children-prop */
import { useRouter } from 'next/router'
import { serializeMDX } from '../../lib/markdown'
import { MDX } from '../../components/mdx'
import VerticalLines from '../../illustrations/vertical-lines.js'

import fs from 'fs/promises'
import path from 'path'

const BASE_DOCS_PATH = 'content/docs'


 export async function getStaticProps() {
   const docs = await loadDocs()
   for (const doc of docs) {
     console.log('loading doc from', doc.localPath)
     doc.compiled = await serializeMDX(doc.content)
   }
   return {
     props: {
       needsLoggedIn: false,
       docs: docs,
     },
   }
 }

  export async function getStaticPaths() {
    const docs = await loadDocs()
    const paths = docs.map(d => d.path)
    console.log('docs paths', paths)
    paths.push('/docs/index.html')
    return {
      paths,
      fallback: false,
    }
  }

  let _cachedDocs = null
  async function loadDocs() {
    if (_cachedDocs) {
      return _cachedDocs
    }
    const docs = []
    for await (const entry of walk(BASE_DOCS_PATH)) {
      if (!entry.match(/\.mdx?$/)) {
        continue
      }
      console.log('entry', entry)
      const content = await fs.readFile(entry, 'utf-8')
      const name = entry.replace(BASE_DOCS_PATH, '').replace(/\/README.mdx?$/, '')
      const pagePath = '/docs' + name.replace(/\.mdx?$/, '')
      docs.push({ content, path: pagePath, localPath: entry })
    }
    _cachedDocs = docs
    return _cachedDocs
  }

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
 * @param {import('../components/types.js').LayoutChildrenProps} props
 * @returns
 */
export default function DocsPage({ docs }) {

  const router = useRouter()
  let doc = null
  let docPath = ['/docs', ...router.query.filepath].join('/')
  if (docPath === '/docs/index.html') {
    docPath = '/docs'
  }
  console.log('docs template page', router.query, docPath)
  console.log('all doc paths', docs.map(d => d.path))
  for (const d of docs) {
    if (d.path === docPath) {
      doc = d
      break
    }
  }
  if (doc === null) {
    console.log('no matching doc. TODO: redirect to 404')
    return <div></div>
  }
  console.log('doc found', doc)

    return (
      <div className="relative overflow-hidden z-0">
        <div className="absolute top-10 right-0 pointer-events-none bottom-0 hidden xl:flex justify-end z-n1">
          <VerticalLines className="h-full"/>
        </div>
        <div className="layout-margins">
          <div className="prose max-w-screen-lg mx-auto text-w3storage-purple my-4 lg:my-32" >
            <MDX mdx={doc.compiled.mdx} />
          </div>
        </div>
      </div>
    )
}