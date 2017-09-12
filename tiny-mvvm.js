/* eslint-disable no-param-reassign, no-cond-assign */

function getExprs(str) {
  const expressions = []
  str.replace(/{{([^}]+)}}/g, ($0, $1) => {
    expressions.push($1)
  })
  return expressions
}

function evalExpr(data, expr) {
  // eslint-disable-next-line
  const fn = new Function(...Object.keys(data), `return ${expr}`)
  return fn(...Object.values(data))
}

function render(template, data) {
  const expressions = getExprs(template)
  if (expressions.length === 0) return template

  return expressions
    .map(expr => evalExpr(data, expr))
    .reduce((x, ev) => x.replace(/{{[^}]+}}/, ev), template)
}

function textNodesUnder(el) {
  let n
  const a = []
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false)
  while (n = walk.nextNode()) a.push(n)
  return a
}

function syncAllTextNodes(textNodes, templates, caches) {
  const output = templates.map(x => render(x, caches))
  textNodes.forEach((node, index) => {
    if (node.nodeValue !== output[index]) node.nodeValue = output[index]
  })
}

/**
 * bind view to object
 * @param {HTMLElement} el
 * @param {object} data
 */
function bindViewToData(el, data) {
  const caches = {}
  const textNodes = textNodesUnder(el).filter(x => x.nodeValue)
  const templates = textNodes.map(x => x.nodeValue)

  const nodes = Array.from(document.querySelectorAll('[data-bind]'))
  const keys = nodes.map(x => x.dataset.bind);


  [...new Set([...keys, ...Object.keys(data)])].forEach((key) => {
    caches[key] = data[key]
    const node = document.querySelector(`[data-bind="${key}"]`)
    const valueKey = node && node.type === 'checkbox' ? 'checked' : 'value'

    Object.defineProperty(data, key, {
      set(v) {
        if (v === caches[key]) return
        caches[key] = v
        if (node) node[valueKey] = v
        syncAllTextNodes(textNodes, templates, caches)
      },
      get() {
        return caches[key]
      },
    })

    if (node) {
      const handleChange = () => {
        let value = node[valueKey]
        if (node.dataset.unit === 'integer') value = Math.trunc(value)
        else if (node.dataset.unit === 'number') value = Number(value)
        data[key] = value
      }

      if ((node.tagName === 'INPUT' && node.type !== 'checkbox') || node.tagName === 'TEXTAREA') {
        node.addEventListener('input', handleChange)
      } else {
        node.addEventListener('change', handleChange)
      }

      if (node.type === 'checkbox') {
        const value = Boolean(caches[key])
        caches[key] = value
        node[valueKey] = value
      } else if (caches[key] !== undefined) {
        node[valueKey] = caches[key]
      }
    }
  })

  syncAllTextNodes(textNodes, templates, caches)
}

module.exports = bindViewToData
