/* eslint-disable react/no-children-prop */
import fs from 'fs/promises'
import path from 'path'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { serializeMDX } from '../../lib/markdown'
import { MDX } from '../../components/mdx'
import PageNotFound from '../404'

import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'
import 'react-pro-sidebar/dist/css/styles.css';

import yaml from 'yaml'
import parseHtml from 'html-react-parser'
import React from 'react'

const BASE_DOCS_PATH = 'content/docs'


/**
 * 
 * @param {object} context 
 * @param {Record<string, any>} context.params
 * @returns {Promise<object>}
 */
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

  

  /**
   * Loads a markdown doc from the local filesystem.
   * 
   * @typedef {import('../../lib/markdown').SerializeMDXResult} SerializeMDXResult
   * 
   * @typedef {object} Doc
   * @property {string} content - raw file content
   * @property {string} docId - url path to doc, without leading '/docs' prefix. e.g. `/concepts/content-addressing`
   * @property {string} path - full url path to doc, e.g. `/docs/${docId}`
   * @property {string} localPath - local path to original file
   * @property {SerializeMDXResult} [compiled]
   * 
   * @param {string} docPath local filepath to markdown doc
   * @returns {Promise<Doc>}
   */
  async function loadDoc(docPath) {
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
    throw new Error(`no doc found with id ${docId}`)
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
async function loadSidebarDefinition() {
  const filename = path.join(BASE_DOCS_PATH, 'sidebar.yaml')
  const content = await fs.readFile(filename, 'utf-8')
  return yaml.parse(content)
}

/**
 * @typedef {object} DocsPageProps
 * @property {Doc} doc
 * @property {SidebarDefinition} sidebar 
 * 
 * @typedef {import('../../components/types.js').LayoutChildrenProps} LayoutChildrenProps
 */

/** 
 * 
 * @param {DocsPageProps & LayoutChildrenProps} props
 * @returns {React.ReactElement}
 */
export default function DocsPage({ doc, sidebar }) {
  const router = useRouter()
  if (!doc || !doc.compiled) {
    console.log('no document matches requested id ', docIdFromPath(router.query.filepath))
    return <PageNotFound />
  }
  
  let toc = <div />
  const { compiled } = doc
  if (!compiled) {
    if ('toc' in compiled) {
      // @ts-ignore
      toc = parseHtml(compiled.toc)
    }
  }

  const sidebarView = makeSidebar(sidebar, doc)
  return (
    <div className="flex">
      <aside className='h-screen sticky top-0'>
        {sidebarView}
      </aside>
      <div className="prose mx-auto text-w3storage-purple px-5" >
        <MDX mdx={compiled.mdx} />
      </div>
      {toc}
    </div>
  )
}

/**
 * Makes a sidebar from the given definition.
 * @param {SidebarDefinition} sidebarSpec 
 * @param {Doc} doc the current document, used to mark which sidebar item is active
 * @returns {React.ReactElement}
 */
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

/**
 * Make the react elements for the given side bar item.
 * @param {SidebarItem} item 
 * @param {Doc} doc 
 * @returns 
 */
function makeSidebarElements(item, doc) {
  if (!item.items) {
    if (!item.path) {
      console.warn('sidebar item missing both "items" and "path", ignoring')
      return <div />
    }
    const href = path.join('/docs', item.path)
    const active = item.path === doc.docId
    return menuLink(href, item.title, active)
  }
  const subItems = item.items.map(i => makeSidebarElements(i, doc))
  return <SubMenu key={item.title} title={item.title} defaultOpen={true}>{subItems}</SubMenu>
}

/**
 * 
 * @param {string} href 
 * @param {any} content 
 * @param {boolean} active 
 * @returns {React.ReactElement}
 */
function menuLink(href, content, active) {
  return (
    <MenuItem active={active} key={href} >
      <Link href={href}>
        {content}
      </Link>
    </MenuItem>
  )
}

/**
 * Takes the 'filepath' from either router.query or getStaticProps context,
 * and returns the path formatted as a docId.
 * 
 * @param {string|string[]|undefined} routerPath 
 * @returns {string}
 */
function docIdFromPath(routerPath) {
  if (!routerPath) {
    return '/'
  }
  if (typeof routerPath === 'string') {
    routerPath = [routerPath]
  }
  const docId = ['', ...routerPath].join('/')
  if (docId === '/index.html') {
    return '/'
  }
  return docId
}