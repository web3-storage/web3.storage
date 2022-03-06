#! /usr/bin/env node

/**
 * This script reads the sidebar definition from sidebars.js in the repo root
 * and does a few things with it so that we can render the sidebar on the HTTP API page.
 *
 * It's heavily based on this blog post: https://cheng.im/using-sidebars-in-docusaurus-pages/
 *
 * Since the HTTP API page isn't a "doc" in the docusuaurus sense, it doesn't render
 * the sidebar by default, but we can render the DocSidebar component ourselves if we
 * have the right props.
 *
 * The script "normalizes" the sidebar definition so it has all the right props to
 * render a DocSidebar, using the loadSidebars Docusaurus function.
 *
 * The new sidebar file is saved as 'src/pages/http-api/sidebars.json'
 *
 */

 const fs = require('fs')
 const path = require('path')
 const matter = require('gray-matter')
 
 const docusaurusConfig = require('../docusaurus.config.js')
 const sidebarsConfig = require('../sidebars.js')
 
 const convertDocLink = (item) => {
   const docId = item.id
   const mdString = fs.readFileSync(path.resolve(__dirname, '..', `docs/${docId}.md`))
 
   const { data: frontMatter } = matter(mdString)
 
   const docPath = frontMatter.slug || docId
   const href = [docusaurusConfig.baseUrl, docPath].join('/').replace(/\/$/, '').replace(/^\//, '').replace(/\/+/, '/')
   
   return {
     type: 'link',
     label: frontMatter.sidebar_label || frontMatter.title,
     collapsed: false,
     href
   }
 }
 
 const normalizeCategories = (entry) => Object.entries(entry).map(([label, items]) => ({
   type: 'category',
   label,
   items,
 }))
 
 const normalizeItem = (item) => {
   if (typeof item === 'string') {
     item = { type: 'doc', id: item }
   }
 
   // console.log('docs item', item)
 
   if (!item.type) {
     return normalizeSidebar(item)
   }
 
   if (item.type === 'doc') {
     return convertDocLink(item)
   }
 
   if (item.type === 'category') {
     const normalizedCategory = {
       ...item,
       items: normalizeSidebar(item.items)
     }
     return [normalizedCategory]
   }
   return [item]
 }
 
 const normalizeSidebar = (sidebar) => {
   const normalized = Array.isArray(sidebar)
     ? sidebar
     : normalizeCategories(sidebar)
   return normalized.flatMap((subItem) => normalizeItem(subItem))
 }
 
 const normalizeSidebars = (sidebarsConfig) => {
   const normalized = {}
   for (const [id, sidebar] of Object.entries(sidebarsConfig)) {
     normalized[id] = normalizeSidebar(sidebar)
   }
   return normalized
 }
 
 const start = () => {
   // console.log('loaded sidebars', filename, loadedSidebars)
   const docsSidebars = normalizeSidebars(sidebarsConfig)
 
   const out = path.resolve(__dirname, '..', 'src', 'components', 'RedocPage', 'sidebars.json')
   fs.writeFileSync(out, JSON.stringify(docsSidebars, null, 2))
 }
 
 start()