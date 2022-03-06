// .vuepress/config.js

const MAIN_DOMAIN = process.env.MAIN_DOMAIN || 'https://web3.storage'
const DEPLOY_DOMAIN = 'https://web3.storage'
const SPEEDCURVE_ID = process.env.SPEEDCURVE_ID || ''
const COUNTLY_KEY = process.env.COUNTLY_KEY || ''
const COUNTLY_URL = process.env.COUNTLY_URL || ''
const pageSuffix = '/'

module.exports = {
  base: '/',
  head: require('./head'),
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Web3.Storage Documentation',
      description: 'Web3.Storage Documentation'
    }
  },
  markdown: {
    pageSuffix,
    extendMarkdown: md => {
      md.set({
        breaks: true
      })
      md.use(require('markdown-it-video'))
      md.use(require('markdown-it-footnote'))
      md.use(require('markdown-it-task-lists'))
      md.use(require('markdown-it-deflist')),
      md.use(require('markdown-it-imsize')),
      md.use(require('markdown-it-image-lazy-loading'))
    }
  },
  themeConfig: {
    defaultImage: '/images/social-card.png',
    author: {
      name: 'Web3.Storage',
      twitter: '@protocollabs'
    },
    keywords:
      'Filecoin, IPFS, web3, dweb, protocol, decentralized web, distributed web, NFT, InterPlanetary File System, dapp, documentation, docs, tutorial, how-to, Protocol Labs',
    // edit links
    domain: DEPLOY_DOMAIN,
    mainDomain: MAIN_DOMAIN,
    docsRepo: 'web3-storage/docs',
    docsDir: 'docs',
    docsBranch: 'main',
    feedbackWidget: {
      docsRepoIssue: 'web3-storage/docs'
    },
    editLinks: false,
    // page nav
    nextLinks: false,
    prevLinks: false,
    // ui/ux
    logo: '/images/w3storage-logo.svg',
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        ariaLabel: 'Select language',
        editLinkText: 'Edit this page',
        lastUpdated: 'Last Updated',
        serviceWorker: {
          updatePopup: {
            message: 'New content is available.',
            buttonText: 'Refresh'
          }
        },
        nav: [
          { text: 'Docs', link: '/' },
          { text: 'About', link: `${MAIN_DOMAIN}/about/`, target: '_self' }
        ],
        sidebar: [
            '/',
          {
            title: 'How-tos',
            collapsable: false,
            children: [
              '/how-tos/store',
              '/how-tos/retrieve',
              '/how-tos/query',
              '/how-tos/list',
              '/how-tos/list-directory-contents',
              '/how-tos/work-with-car-files',
              '/how-tos/generate-api-token',
              '/how-tos/troubleshooting'
            ]
          },
          {
            title: 'Concepts',
            collapsable: false,
            children: [
                '/concepts/content-addressing',
                '/concepts/decentralized-storage',
                '/concepts/storage-economics',
            ]
          },
          {
            title: 'Examples',
            collapsable: false,
            children: [
              '/examples/getting-started',
              '/examples/image-gallery',
            ]
          },
          {
            title: 'Reference',
            collapsable: false,
            children: [
              ['https://web3.storage/docs/http-api.html','HTTP API reference'],
              '/reference/client-library',
              '/reference/js-utilities',
            ]
          },
          {
            title: 'Community',
            collapsable: false,
            children: [
                '/community/help-and-support'
            ]
          },
        ],
        footer: {
          madeBy: {
            sentence: 'Made with 💛 by',
            text: 'Protocol Labs',
            link: 'https://protocol.ai'
          },
          nav:[
            { text: 'Status', link: `https://status.web3.storage/` },
            { text: 'Terms of service', link: `${MAIN_DOMAIN}/terms` },
            { text: 'Open an issue', link: `https://web3.storage/docs/community/help-and-support/#bug-reports-or-feature-requests` },
            { text: 'Contact us', link: `https://web3.storage/docs/community/help-and-support` },
          ]
        }
      }
    },
    countly: {
      key: COUNTLY_KEY,
      url: COUNTLY_URL
    },
     algolia: {
       appId: '9ARXAK1OFV',
       apiKey: '358b95b4567a562349f2c806c152fada',
       indexName: 'web3storage-docs'
     },
  },
  plugins: [
    [require('./plugins/vuepress-plugin-speedcurve'), { id: SPEEDCURVE_ID }],
    [
      'vuepress-plugin-clean-urls',
      {
        normalSuffix: pageSuffix,
        indexSuffix: pageSuffix,
        notFoundPath: '/ipfs-404.html'
      }
    ],
    [
      'vuepress-plugin-seo',
      {
        siteTitle: ($page, $site) => $site.title,
        title: $page => $page.title,
        description: $page => $page.frontmatter.description,
        author: ($page, $site) =>
          $page.frontmatter.author || $site.themeConfig.author,
        tags: $page => $page.frontmatter.tags,
        twitterCard: _ => 'summary_large_image',
        type: $page =>
          ['articles', 'posts', 'blog'].some(folder =>
            $page.regularPath.startsWith('/' + folder)
          )
            ? 'article'
            : 'website',
        url: ($page, $site, path) => ($site.themeConfig.domain || '') + path,
        image: ($page, $site) =>
          $page.frontmatter.image
            ? ($site.themeConfig.domain || '') + $page.frontmatter.image
            : ($site.themeConfig.domain || '') + $site.themeConfig.defaultImage,
        publishedAt: $page =>
          $page.frontmatter.date && new Date($page.frontmatter.date),
        modifiedAt: $page => $page.lastUpdated && new Date($page.lastUpdated),
        customMeta: (add, context) => {
          const { $site, image } = context
          add(
            'twitter:site',
            ($site.themeConfig.author && $site.themeConfig.author.twitter) || ''
          )
          add('image', image)
          add('keywords', $site.themeConfig.keywords)
        }
      }
    ],
    [
      'vuepress-plugin-canonical',
      {
        // add <link rel="canonical" header (https://tools.ietf.org/html/rfc6596)
        // to deduplicate SEO across all copies loaded from various public gateways
        baseURL: DEPLOY_DOMAIN
      }
    ],
    [
      'vuepress-plugin-sitemap',
      {
        hostname: DEPLOY_DOMAIN,
        exclude: ['/ipfs-404.html']
      }
    ],
    [
      'vuepress-plugin-robots',
      {
        host: DEPLOY_DOMAIN
      }
    ],
    [
      '@vuepress/html-redirect',
      {
        duration: 0
      }
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'callout',
        defaultTitle: ''
      }
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'right',
        defaultTitle: ''
      }
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'left',
        defaultTitle: ''
      }
    ],
    'vuepress-plugin-chunkload-redirect',
    'vuepress-plugin-ipfs',
    'vuepress-plugin-tabs',
    ['vuepress-plugin-code-copy', { align: 'bottom', color: '#fff' }]
  ],
  extraWatchFiles: ['.vuepress/nav/en.js']
}
