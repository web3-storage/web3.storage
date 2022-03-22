
const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

function stylesToText (styles) {
  return Object.entries(styles).map(([k, v]) => `${camelToSnakeCase(k)}: ${v};`).join('\n')
}

function resetPrismStyles (plainStyles) {
  const tokens = [
    'comment', 'prolog', 'doctype', 'cdata', 'punctuation', 'namespace',
    'property', 'tag', 'number', 'constant', 'symbol', 'boolean', 'selector', 'attr-name',
    'string', 'char', 'builtin', 'inserted', 'property.string', 'operator', 'entity', 'url',
    'variable', 'atrule', 'attr-value', 'keyword', 'regex', 'important', 'bold', 'italic',
    'entity', 'deleted'
  ]
  const classes = tokens.map(t => `.token.${t}`)
  const selector = classes.join(', ')
  return `
  ${selector} {
    ${plainStyles}
    font-style: initial;
  }
  `
}

export function prismThemeToCSS (theme) {
  const { plain, styles } = theme
  const defaultPlainOptions = {
    color: 'initial',
    backgroundColor: 'initial'
  }
  const plainCSS = stylesToText(plain ?? defaultPlainOptions)
  const containerStyle = `code[class*="language-"], pre[class*="language-"] {
    ${plainCSS}
  }`
  const rules = [containerStyle]
  for (const s of styles) {
    const styleText = stylesToText(s.style)
    const selector = s.types.map(t => `.token.${t}`).join(', ')
    rules.push(`${selector} { ${styleText} }`)
  }

  rules.unshift(resetPrismStyles(plainCSS))
  return rules.join('\n\n')
}
