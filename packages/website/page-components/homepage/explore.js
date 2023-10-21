import { Sectionals, Column, Sectional } from '../../components/layout';
import TextBlock from '../../components/textblock/textblock';
import CardListBlock from '../../components/cardlistblock/cardlistblock';

export default function Explore() {
  return (
    <Sectionals id="explore_section">
      <Sectional id="section_explore-docs" className="grid-noGutter'">
        <Column className="col-4_md-7_ti-8 column-1" pushLeft="off-0_md-1_sm-0">
          <TextBlock
            block={{
              format: 'medium',
              heading: 'Open product. Open book.',
              cta: {
                url: '/docs/',
                text: 'EXPLORE DOCS',
                theme: 'dark',
                event: '',
                ui: '',
                action: '',
              },
            }}
          />
        </Column>
        <Column className="col-8_md-10_sm-12_mi-10 column-2" pushLeft="off-1_md-1_sm-0_mi-1">
          <CardListBlock
            block={{
              type: 'card_list_block',
              cols: {
                num: 'col-8_md-10_sm-12_mi-10',
                push_left: 'off-1_md-1_sm-0_mi-1',
              },
              cards: [
                {
                  type: 'D',
                  categories: [
                    {
                      heading: 'Welcome',
                      links: [
                        {
                          url: '/docs/#quickstart',
                          text: 'Quickstart',
                        },
                        {
                          url: '/docs/#create-an-account',
                          text: 'Create an Account',
                        },
                        {
                          url: '/docs/#get-an-api-token',
                          text: 'Get an API token',
                        },
                        {
                          url: '/docs/#create-the-upload-script',
                          text: 'Create the Upload Script',
                        },
                        {
                          url: '/docs/#run-the-script',
                          text: 'Run the Script',
                        },
                        {
                          url: '/docs/#get-your-file',
                          text: 'Get your file',
                        },
                        {
                          url: '/docs/#next-steps',
                          text: 'Next Steps',
                        },
                      ],
                    },
                    {
                      heading: 'Concepts',
                      links: [
                        {
                          url: '/docs/concepts/content-addressing',
                          text: 'Content Addressing',
                        },
                        {
                          url: '/docs/concepts/decentralized-storage',
                          text: 'Decentralized Storage',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'D',
                  categories: [
                    {
                      heading: 'How-tos',
                      links: [
                        {
                          url: '/docs/how-tos/store/',
                          text: 'Store',
                        },
                        {
                          url: '/docs/how-tos/retrieve',
                          text: 'Retrieve',
                        },
                        {
                          url: '/docs/how-tos/query',
                          text: 'Query',
                        },
                        {
                          url: '/docs/how-tos/list',
                          text: 'List',
                        },
                        {
                          url: '/docs/how-tos/work-with-car-files',
                          text: 'Work with Content',
                        },
                        {
                          url: '/docs/how-tos/generate-api-token',
                          text: 'Generate an API Token',
                        },
                        {
                          url: '/docs/how-tos/troubleshooting',
                          text: 'Troubleshooting',
                        },
                      ],
                    },
                    {
                      heading: 'Reference',
                      links: [
                        {
                          url: '/docs/reference/http-api/',
                          text: 'HTTP API Reference',
                        },
                        {
                          url: '/docs/reference/js-client-library',
                          text: 'Javascript Client Library',
                        },
                      ],
                    },
                  ],
                },
              ],
            }}
          />
        </Column>
        <Column className="col-3 column-3">
          <TextBlock
            block={{
              format: 'medium',
              heading: 'Open product. Open book.',
              cta: {
                url: '/docs/',
                text: 'EXPLORE DOCS',
                theme: 'dark',
                event: '',
                ui: '',
                action: '',
              },
            }}
          />
        </Column>
      </Sectional>
    </Sectionals>
  );
}
