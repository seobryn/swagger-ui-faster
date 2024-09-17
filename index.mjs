'use strict'
import { __dirname } from './utils/fs-utils.mjs'
import fs from 'fs'
import { serveStatic } from '@seobryn/faster'
import swaggerUi from 'swagger-ui-dist'

const favIconHtml = '<link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />' +
  '<link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />'

const dName = __dirname(import.meta.url)

let swaggerInit

function trimQuery (url) {
  return url.split('?')[0]
}

const generateHTML = function (swaggerDoc, opts, options, customCss, customfavIcon, swaggerUrl, customSiteTitle) {
  let isExplorer
  let customJs
  let swaggerUrls
  let baseURL = '.'

  if (opts && typeof opts === 'object') {
    options = opts.swaggerOptions
    customCss = opts.customCss
    customJs = opts.customJs
    customfavIcon = opts.customfavIcon
    swaggerUrl = opts.swaggerUrl
    swaggerUrls = opts.swaggerUrls
    isExplorer = opts.explorer || !!swaggerUrls
    customSiteTitle = opts.customSiteTitle
    baseURL = opts.baseURL
  } else {
    // support legacy params based function
    isExplorer = opts
  }
  options = options || {}
  const explorerString = isExplorer ? '' : '.swagger-ui .topbar .download-url-wrapper { display: none }'
  customCss = explorerString + ' ' + customCss || explorerString
  customfavIcon = customfavIcon || false
  customSiteTitle = customSiteTitle || 'Swagger UI'
  const html = fs.readFileSync(dName + '/indexTemplate.html.tpl')
  try {
    fs.unlinkSync(dName + '/index.html')
  } catch (e) {

  }

  const favIconString = customfavIcon ? '<link rel="icon" href="' + customfavIcon + '" />' : favIconHtml
  const htmlWithBaseURL = html.toString().replace(/{BASEURL}/g, baseURL)
  const htmlWithCustomCss = htmlWithBaseURL.replace('<% customCss %>', customCss)
  const htmlWithFavIcon = htmlWithCustomCss.replace('<% favIconString %>', favIconString)
  const htmlWithCustomJs = htmlWithFavIcon.replace('<% customJs %>', customJs ? `<script src="${customJs}"></script>` : '')

  const initOptions = {
    swaggerDoc: swaggerDoc || undefined,
    customOptions: options,
    swaggerUrl: swaggerUrl || undefined,
    swaggerUrls: swaggerUrls || undefined
  }
  const js = fs.readFileSync(dName + '/swagger-ui-init.js.tpl')
  swaggerInit = js.toString().replace('<% swaggerOptions %>', stringify(initOptions))
  return htmlWithCustomJs.replace('<% title %>', customSiteTitle)
}

const setup = function (swaggerDoc, opts, options, customCss, customfavIcon, swaggerUrl, customSiteTitle) {
  const htmlWithOptions = generateHTML(swaggerDoc, opts, options, customCss, customfavIcon, swaggerUrl, customSiteTitle)
  /**
   * @param {import('@seobryn/faster/src/faster.mjs').FasterRequest} req
   * @param {import('@seobryn/faster/src/faster.mjs').FasterResponse} res
   */
  return async function (req, res) {
    return res.send(htmlWithOptions, {
      'Content-Length': Buffer.byteLength(htmlWithOptions),
      'Content-Type': 'text/html'
    })
  }
}

/**
 *
 * @param {import('@seobryn/faster/src/faster.mjs').FasterRequest} req
 * @param {import('@seobryn/faster/src/faster.mjs').FasterResponse} res
 */
async function swaggerInitFn (req, res) {
  if (trimQuery(req.url).endsWith('/package.json')) {
    return res.status(404).send('Not Found', { 'Content-Type': 'text/plain' })
  } else if (trimQuery(req.url).endsWith('/swagger-ui-init.js')) {
    return res.status(200).send(swaggerInit, { 'Content-Type': 'application/javascript' })
  }
}

const swaggerInitFunction = function (swaggerDoc, opts) {
  const js = fs.readFileSync(dName + '/swagger-ui-init.js.tpl')
  const swaggerInitFile = js.toString().replace('<% swaggerOptions %>', stringify(opts))
  /**
   * @param {import('@seobryn/faster/src/faster.mjs').FasterRequest} req
   * @param {import('@seobryn/faster/src/faster.mjs').FasterResponse} res
   */
  return async function (req, res) {
    if (trimQuery(req.url).endsWith('/package.json')) {
      return res.status(404).send('Not Found')
    } else if (req.url.endsWith('/swagger-ui-init.js')) {
      res.status(200).send(swaggerInitFile, {
        'Content-Length': Buffer.byteLength(swaggerInitFile),
        'Content-Type': 'application/javascript'
      })
    }
  }
}

/**
 *
 * @param {string} [options.directory] - Directory to serve
 * @param {number} [options.maxAge] - Max age cache
 * @param {string} [options.fallbackFile] - Default file to serve
 *
 * @return {import('@seobryn/faster/src/faster.mjs').FnCallback}
 */
const swaggerAssetMiddleware = (options = {}) => {
  const directory = swaggerUi.getAbsoluteFSPath()
  const staticServer = serveStatic(Object.assign({ directory }, options))

  /**
   * @param {import('@seobryn/faster/src/faster.mjs').FasterRequest} req
   * @param {import('@seobryn/faster/src/faster.mjs').FasterResponse} res
   */
  return async (req, res) => {
    const { url } = req
    if (/(\/|index\.html)$/.test(url)) {
      return null
    }

    return await staticServer(req, res)
  }
}

const serveFiles = function (swaggerDoc, opts) {
  opts = opts || {}
  const initOptions = {
    swaggerDoc: swaggerDoc || undefined,
    customOptions: opts.swaggerOptions || {},
    swaggerUrl: opts.swaggerUrl || {},
    swaggerUrls: opts.swaggerUrls || undefined
  }
  const swaggerInitWithOpts = swaggerInitFunction(swaggerDoc, initOptions)

  return [swaggerInitWithOpts, swaggerAssetMiddleware()]
}

const serve = [swaggerInitFn, swaggerAssetMiddleware()]
const serveWithOptions = options => [swaggerInitFn, swaggerAssetMiddleware(options)]

const stringify = function (obj, prop) {
  const placeholder = '____FUNCTIONPLACEHOLDER____'
  const fns = []
  let json = JSON.stringify(obj, function (key, value) {
    if (typeof value === 'function') {
      fns.push(value)
      return placeholder
    }
    return value
  }, 2)
  json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function (_) {
    return fns.shift()
  })
  return 'var options = ' + json + ';'
}

export default {
  setup,
  serve,
  serveWithOptions,
  generateHTML,
  serveFiles
}
