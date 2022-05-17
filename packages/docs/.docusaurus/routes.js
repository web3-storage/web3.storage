
import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/docs/reference/http-api/',
    component: ComponentCreator('/docs/reference/http-api/','6d3'),
    exact: true
  },
  {
    path: '/docs/search',
    component: ComponentCreator('/docs/search','cab'),
    exact: true
  },
  {
    path: '/docs/',
    component: ComponentCreator('/docs/','838'),
    routes: [
      {
        path: '/docs/',
        component: ComponentCreator('/docs/','fb0'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/community/help-and-support',
        component: ComponentCreator('/docs/community/help-and-support','542'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/concepts/content-addressing',
        component: ComponentCreator('/docs/concepts/content-addressing','4bc'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/concepts/decentralized-storage',
        component: ComponentCreator('/docs/concepts/decentralized-storage','6e1'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/concepts/storage-economics',
        component: ComponentCreator('/docs/concepts/storage-economics','13a'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/examples/getting-started',
        component: ComponentCreator('/docs/examples/getting-started','5ef'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/examples/image-gallery',
        component: ComponentCreator('/docs/examples/image-gallery','8d1'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/how-tos/generate-api-token',
        component: ComponentCreator('/docs/how-tos/generate-api-token','205'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/how-tos/list',
        component: ComponentCreator('/docs/how-tos/list','6a5'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/how-tos/list-directory-contents',
        component: ComponentCreator('/docs/how-tos/list-directory-contents','3fd'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/how-tos/pinning-services-api',
        component: ComponentCreator('/docs/how-tos/pinning-services-api','442'),
        exact: true
      },
      {
        path: '/docs/how-tos/query',
        component: ComponentCreator('/docs/how-tos/query','18b'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/how-tos/retrieve',
        component: ComponentCreator('/docs/how-tos/retrieve','f38'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/how-tos/store',
        component: ComponentCreator('/docs/how-tos/store','4c7'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/how-tos/troubleshooting',
        component: ComponentCreator('/docs/how-tos/troubleshooting','cbc'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/how-tos/work-with-car-files',
        component: ComponentCreator('/docs/how-tos/work-with-car-files','1f1'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/reference/go-client-library',
        component: ComponentCreator('/docs/reference/go-client-library','075'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/reference/js-client-library',
        component: ComponentCreator('/docs/reference/js-client-library','f5f'),
        exact: true,
        'sidebar': "docs"
      },
      {
        path: '/docs/reference/js-utilities',
        component: ComponentCreator('/docs/reference/js-utilities','9cc'),
        exact: true,
        'sidebar': "docs"
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*')
  }
];
