module.exports = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'How-tos',
      items: [
        'how-tos/store',
        'how-tos/retrieve',
        'how-tos/query',
        'how-tos/list',
        'how-tos/list-directory-contents',
        'how-tos/work-with-car-files',
        'how-tos/generate-api-token',
        'how-tos/get-status',
        'how-tos/pinning-services-api',
        'how-tos/troubleshooting'
      ]
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/content-addressing',
        'concepts/decentralized-storage',
        'concepts/storage-economics'
      ]
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/getting-started',
        'examples/image-gallery'
      ]
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/js-client-library',
        'reference/js-utilities',
        'reference/go-client-library',
        {
          type: 'link',
          label: 'web3.storage HTTP API',
          href: '/reference/http-api/'
        }
      ]
    },
    {
      type: 'category',
      label: 'Community',
      items: [
        'community/help-and-support'
      ]
    }
  ]
}
