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
const yaml = require('yaml')

const { loadSidebars } = require('@docusaurus/plugin-content-docs/lib/sidebars')
const docusaurusConfig = require('../docusaurus.config')

const convertDocLink = (item) => {
  const docId = item.id;
  const mdString = fs.readFileSync(path.resolve(__dirname, '..', `docs/${docId}.md`));

  const { data: frontMatter } = matter(mdString);

  const docPath = frontMatter.slug || docId
  const href = [docusaurusConfig.baseUrl, docPath].join('/').replace(/\/+/, '/')
  return {
    type: 'link',
    label: frontMatter['sidebar_label'] || frontMatter.title,
    collapsed: false,
    href,
  };
};

const normalizeItem = (item) => {
  switch (item.type) {
    case 'category':
      return { ...item, items: item.items.map(normalizeItem), collapsed: true };
    case 'ref':
    case 'doc':
      return convertDocLink(item);
    case 'link':
    default:
      return item;
  }
};

const start = () => {
  const filename = path.resolve(__dirname, '..', 'sidebars.js')
  const loadedSidebars = loadSidebars(filename, { sidebarCollapsible: false });

  // console.log('loaded sidebars', filename, loadedSidebars)
  const docsSidebars = Object.entries(loadedSidebars).reduce((acc, [sidebarId, sidebarItems]) => {
    acc[sidebarId] = sidebarItems.map(normalizeItem);
    return acc;
  }, {});

  const out = path.resolve(__dirname, '..', 'src', 'components', 'RedocPage', 'sidebars.json')
  fs.writeFileSync(out, JSON.stringify(docsSidebars));
};

start();