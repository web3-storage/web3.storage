const path = require('path')

module.exports = function (context) {
  const {siteConfig} = context
  const {themeConfig} = siteConfig
  const {countly: countlyConfig} = themeConfig || {}

  if (!countlyConfig) {
    throw new Error(
      `You need to specify "countly" object in "themeConfig" with "appKey" field in it to use this plugin.`,
    )
  }

  const { appKey, countlyUrl } = countlyConfig

  if (!appKey) {
    throw new Error(
      'You specified the "countly" object in "themeConfig" but the "appKey" field was missing.'
    )
  }

  if (!countlyUrl) {
    throw new Error(
      'You specified the "countly" object in "themeConfig" but the "countlyUrl" field was missing.'
    )
  }

  const isProd = process.env.NODE_ENV === 'production'
  const enabled = isProd || process.env.DEBUG_ENABLE_COUNTLY

  return {
    name: 'docusaurus-plugin-web3storage-docs',

    getClientModules() {
      return enabled ? [path.resolve(__dirname, './analytics')] : []
    },

    injectHtmlTags() {
      if (!enabled) {
        return {}
      }
      return {
        headTags: [
          {
            tagName: 'script',
            attributes: {
              src: 'https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/lib/countly.min.js',
            }
          }
        ],
        postBodyTags: [
          {
            tagName: 'script',
            innerHTML: `
            document.addEventListener('readystatechange', event => {
              if (event.target.readyState !== "complete") {
                return
              }
              
              console.log('initializing countly sdk with url: ${countlyUrl}')
              Countly.init({
                app_key: '${appKey}',
                url: '${countlyUrl}',
                app_version: "1.0",
                debug: ${(!isProd).toString()}
              })

              Countly.track_sessions()
              Countly.track_clicks()
              Countly.track_scrolls()

              Countly.track_pageview(window.location.pathname)
             });
            `
          }
        ]
      }
    },
  }
}
