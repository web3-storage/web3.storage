/* eslint-disable react/no-children-prop */
import fs from 'fs/promises'
import path from 'path'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { serializeMDX } from '../../lib/markdown'
import { MDX } from '../../components/mdx'

import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'
import 'react-pro-sidebar/dist/css/styles.css';

const BASE_DOCS_PATH = 'content/docs'


 export async function getStaticProps() {
   const docs = await loadDocs()
   for (const doc of docs) {
    //  console.log('loading doc from', doc.localPath)
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
    if (process.env.NEXT_PUBLIC_ENV === 'dev') {
      // this seems to be needed for the dev server, but breaks the export...
      paths.push('/docs/index.html')
    }
    return {
      paths,
      fallback: false,
    }
  }

  let _cachedDocs = null
  async function loadDocs() {
    if (_cachedDocs && process.env.NEXT_PUBLIC_ENV !== 'dev') {
      return _cachedDocs
    }
    const docs = []
    for await (const entry of walk(BASE_DOCS_PATH)) {
      if (!entry.match(/\.mdx?$/)) {
        continue
      }
      const content = await fs.readFile(entry, 'utf-8')
      const name = entry.replace(BASE_DOCS_PATH, '').replace(/\/README.mdx?$/, '')
      const docId = name.replace(/\.mdx?$/, '')
      const pagePath = '/docs' + docId
      docs.push({ content, docId, path: pagePath, localPath: entry })
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
  const filepath = router.query.filepath || []
  let docId = ['', ...filepath].join('/')
  let docPath = '/docs' + docId
  if (docPath === '/docs/index.html') {
    docPath = '/docs'
    docId = '/'
  }
  // console.log('docs template page', router.query, docPath)
  // console.log('all doc paths', docs.map(d => d.path))
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

  const sidebar = makeSidebar({ docs, docId })
  return (
    <div className="flex">
      <aside className='h-screen sticky top-0'>
        {sidebar}
      </aside>
        <div className="flex mx-auto text-w3storage-purple px-5" >
          <MDX mdx={doc.compiled.mdx} />
      </div>
    </div>
  )
}

// TODO: this is a little too hard-coded for my liking...
function makeSidebar({ docs, docId }) {
  const items = [
    menuLink('/docs/index.html', 'Welcome', docId === '/'),
    submenu({ title: 'How-Tos', prefix: '/how-tos/', docs, docId }),
    submenu({ title: 'Concepts', prefix: '/concepts/', docs, docId }),
    submenu({ title: 'Examples', prefix: '/examples/', docs, docId }),
    submenu({ title: 'Reference', prefix: '/reference/', docs, docId }),
    submenu({ title: 'Community', prefix: '/community/', docs, docId }),
  ]

  return (
    <ProSidebar width={300} >
      <Menu popperArrow={false} >
        {items}
      </Menu>
    </ProSidebar>
  )
}

function submenu({title, prefix, docs, docId}) {
  const weightedItems = []
  for (const d of docs) {
    if (!d.docId.startsWith(prefix)) {
      continue
    }
    const active = d.docId === docId
    const frontmatter = d.compiled.frontmatter || {}
    const title = frontmatter.title
    const weight = frontmatter.weight || 0
    if (!title) {
      // TODO: add fallback/default instead?
      throw new Error('markdown doc is missing "title" front matter')
    }
    weightedItems.push({ 
      item: menuLink(d.path, title, active),
      weight,
    })
  }

  weightedItems.sort((a, b) => a.weight - b.weight).reverse()
  const items = weightedItems.map(i => i.item)

  const defaultOpen = docId.startsWith(prefix)

  return (
    <SubMenu title={title} defaultOpen={defaultOpen} key={title} >
      {items}
    </SubMenu>
  )
}


function menuLink(href, content, active) {
  return (
    <MenuItem active={active} key={href} >
      <Link href={href}>
        {content}
      </Link>
    </MenuItem>
  )
}