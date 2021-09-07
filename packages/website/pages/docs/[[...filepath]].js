/* eslint-disable react/no-children-prop */
import React from 'react'
import { useRouter } from 'next/router'

import { MDX } from '../../components/mdx'
import Sidebar from '../../components/docs/sidebar'
import TOC from '../../components/docs/toc'
import PageNotFound from '../404'
import { serializeMDX } from '../../lib/markdown'
import { loadDocsPaths, loadDocById, loadSidebarDefinition } from '../../lib/docs'

/**
 * @typedef {import('../../lib/docs').Doc} Doc
 * @typedef {import('../../lib/docs').SidebarDefinition} SidebarDefinition
 * 
 * @typedef {object} DocsPageProps
 * @property {Doc} doc
 * @property {SidebarDefinition} sidebar
 * @property {boolean} [needsLoggedIn]
 * 
 * @typedef {import('../../components/types.js').LayoutChildrenProps} LayoutChildrenProps
 * 
 */


/**
 * getStaticProps loads the doc associated with the current url path
 * and serializes the MDX content. It also loads the sidebar definition
 * from sidebar.yaml
 * 
 * @param {object} context 
 * @param {Record<string, any>} context.params
 * @returns {Promise<{props: DocsPageProps}>}
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

/**
 * getStaticPaths walks the filesystem to find markdown files and returns
 * URL paths for each.
 * @returns {Promise<{paths: string[], fallback: boolean}>}
 */
export async function getStaticPaths() {
  const paths = await loadDocsPaths()
  if (process.env.NODE_ENV === 'development') {
    // this seems to be needed for the dev server, but breaks the export...
    paths.push('/docs/index.html')
  }
  return {
    paths,
    fallback: false,
  }
}

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
  
  const { compiled } = doc
  return (
    <div className="flex">
      <aside className='h-screen sticky top-0'>
        <Sidebar sidebar={sidebar} doc={doc} />
      </aside>
      <div className="prose mx-auto text-w3storage-purple px-5" >
        <MDX mdx={compiled.mdx} />
      </div>
      <div className="hidden md:block h-screen sticky top-0 p-10">
        <TOC toc={compiled.toc} />
      </div>
    </div>
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