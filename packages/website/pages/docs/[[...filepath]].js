/* eslint-disable react/no-children-prop */
import fs from 'fs/promises'
import path from 'path'

import Link from 'next/link'

import { serializeMDX } from '../../lib/markdown'
import { MDX } from '../../components/mdx'

import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'
import 'react-pro-sidebar/dist/css/styles.css';

import yaml from 'yaml'
import parseHtml from 'html-react-parser'

const BASE_DOCS_PATH = 'content/docs'


 export async function getStaticProps(context) {
   const docId = docIdFromPath(context.params.filepath)
   const doc = await loadDocById(docId)
   doc.compiled = await serializeMDX(doc.content)
  
   const sidebar = await loadSidebarDefinition()
   return {
     props: {
       needsLoggedIn: false,
       doc,
       sidebar,
     },
   }
 }

  export async function getStaticPaths() {
    const docs = await loadDocs()
    const paths = docs.map(d => d.path)
    if (process.env.NODE_ENV === 'development') {
      // this seems to be needed for the dev server, but breaks the export...
      paths.push('/docs/index.html')
    }
    return {
      paths,
      fallback: false,
    }
  }

  async function loadDocs() {
    const docs = []
    for await (const entry of walk(BASE_DOCS_PATH)) {
      if (!entry.match(/\.mdx?$/)) {
        continue
      }
      const doc = await loadDoc(entry)
      docs.push(doc)
    }
    return docs
  }

  async function loadDoc(docPath) {
    const content = await fs.readFile(docPath, 'utf-8')
    const name = docPath.replace(BASE_DOCS_PATH, '').replace(/\/README.mdx?$/, '')
    const docId = name.replace(/\.mdx?$/, '')
    const pagePath = '/docs' + docId
    return { content, docId, path: pagePath, localPath: docPath }
  }

  async function loadDocById(docId) {
    const candidates = [`${docId}.md`, `${docId}.mdx`, `${docId}/README.md`]
    for (const filename of candidates) {
      const localPath = path.join(BASE_DOCS_PATH, filename)
      try {
        await fs.access(localPath)
        return loadDoc(localPath)
      } catch (e) {
      }
    }
    throw new Error('no doc found with id', docId)
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

async function loadSidebarDefinition() {
  const filename = path.join(BASE_DOCS_PATH, 'sidebar.yaml')
  const content = await fs.readFile(filename, 'utf-8')
  return yaml.parse(content)
}

/**
 *
 * @param {import('../components/types.js').LayoutChildrenProps} props
 * @returns
 */
export default function DocsPage({ doc, sidebar }) {

  // console.log('docs template page', router.query, docPath)
  // console.log('all doc paths', docs.map(d => d.path))

  if (doc === null) {
    console.log('no matching doc. TODO: redirect to 404')
    return <div></div>
  }
  
  const toc = doc.compiled.toc ? parseHtml(doc.compiled.toc) : <div />
  const sidebarView = makeSidebar(sidebar, doc)
  return (
    <div className="flex">
      <aside className='h-screen sticky top-0'>
        {sidebarView}
      </aside>
      <div className="prose mx-auto text-w3storage-purple px-5" >
        <MDX mdx={doc.compiled.mdx} />
      </div>
      {toc}
    </div>
  )
}

// TODO: this is a little too hard-coded for my liking...
function makeSidebar(sidebarSpec, doc) {
  const items = sidebarSpec.items.map(i => makeSidebarElements(i, doc))
  return (
    <ProSidebar width={300} >
      <Menu >
        {items}
      </Menu>
    </ProSidebar>
  )
}


function makeSidebarElements(item, doc) {
  if (!item.items) {
    const href = path.join('/docs', item.path)
    const active = item.path === doc.docId
    return menuLink(href, item.title, active)
  }
  const subItems = item.items.map(makeSidebarElements)
  return <SubMenu key={item.title} title={item.title} defaultOpen={true}>{subItems}</SubMenu>
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

function docIdFromPath(routerPath) {
  const docId = ['', ...routerPath].join('/')
  if (docId === '/index.html') {
    return '/'
  }
  return docId
}