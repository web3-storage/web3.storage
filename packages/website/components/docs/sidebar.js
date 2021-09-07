import React from 'react'
import path from 'path'
import Link from 'next/link'

import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'
import 'react-pro-sidebar/dist/css/styles.css';

/**
 * @typedef {import('../../lib/docs').Doc} Doc
 * @typedef {import('../../lib/docs').SidebarDefinition} SidebarDefinition
 * @typedef {import('../../lib/docs').SidebarItem} SidebarItem
 */

/**
 * Makes a sidebar from the given definition.
 * @param {object} props
 * @param {SidebarDefinition} props.sidebar 
 * @param {Doc} props.doc the current document, used to mark which sidebar item is active
 * @returns {React.ReactElement}
 */
 export default function Sidebar({sidebar, doc}) {
  const items = sidebar.items.map(i => makeSidebarElements(i, doc))
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
  if (!item || !item.items) {
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