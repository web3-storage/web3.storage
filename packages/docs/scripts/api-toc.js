
/**
 * This script generates a table-of-contents for the HTTP API reference page
 * by pulling heading ids and titles from the OpenAPI schema yaml file.
 *
 * The output is a JSON array of Docusaurus TOC items, saved to 'src/pages/http-api/toc.json'
 *
 */

const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

function makeApiToc (specFilename) {
  const specStr = fs.readFileSync(specFilename, 'utf-8')
  const schema = yaml.parse(specStr)
  const { paths } = schema

  const items = [
    {
      id: 'section/Authentication',
      value: 'Authentication',
      children: []
    }
  ]

  for (const methods of Object.values(paths)) {
    for (const operation of Object.values(methods)) {
      const item = {
        id: 'operation/' + operation.operationId,
        value: operation.summary,
        children: []
      }
      items.push(item)
    }
  }
  return items
}

function writeToc (toc, filename) {
  fs.writeFileSync(filename, JSON.stringify(toc), 'utf-8')
}

function main () {
  const specFilename = path.resolve(__dirname, '..', 'static', 'schema.yml')
  const out = path.resolve(__dirname, '..', 'src', 'components', 'RedocPage', 'toc.json')

  console.log('generating table of contents for HTTP API from spec at ', specFilename)
  const toc = makeApiToc(specFilename)
  console.log('writing TOC to ', out)
  writeToc(toc, out)
}

main()
