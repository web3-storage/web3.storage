import { Sectionals, Column, Sectional } from '../../components/layout';
import Img from '../../components/cloudflareImage';
import TextBlock from '../../components/textblock/textblock';
import CardListBlock from '../../components/cardlistblock/cardlistblock';
import ImageBlock from '../../components/imageblock/imageblock';
import ImageCross from '../../public/images/illustrations/cross.png';

export default function GettingStarted() {
  return (
    <Sectionals id="getting_started_section">
      <Sectional id="section_get-started" className="grid">
        <Column className="col-5_sm-8_mi-10_ti-12 column-1" pushLeft="off-0_sm-2_mi-1_ti-0">
          <div id="section_get-started-cross">
            <Img alt="" src={ImageCross} />
          </div>
          <TextBlock
            block={{
              format: 'medium',
              heading: 'Get Started with web3.storage',
              description:
                'Choose your own way to store and retrieve using web3.storage. Use your email address or GitHub to get 5 GiB storage for free, with paid plans starting at only $3.',
              cta: {
                url: '/login',
                text: 'CREATE AN ACCOUNT',
                theme: 'dark',
                event: '',
                ui: '',
                action: '',
              },
            }}
          />
        </Column>
        <Column className="col-7_sm-8_mi-10_ti-12 column-2" pushLeft="off-0_sm-2_mi-1_ti-0">
          <ImageBlock
            block={{
              id: 'get-started-image-files',
              src: '/images/index/app-ui-screenshot-file-manager.png',
            }}
          />
          <ImageBlock
            block={{
              id: 'get-started-image-upload',
              src: '/images/index/app-ui-screenshot-file-upload.png',
            }}
          />
        </Column>
      </Sectional>
      <Sectional id="section_get-started-cards" className="grid">
        <Column className="col-12_sm-8_mi-10_ti-12 column-1" pushLeft="off-0_sm-2_mi-1_ti-0">
          <CardListBlock
            block={{
              type: 'card_list_block',
              cols: {
                num: 'col-12_sm-8_mi-10_ti-12',
                push_left: 'off-0_sm-2_mi-1_ti-0',
              },
              direction: 'row',
              gap: '3',
              cards: [
                {
                  type: 'B',
                  label: 'JS Client Library',
                  feature: "<span class='highlight'>npm install</span> web3.storage",
                  description:
                    'Import the lightweight web3.storage library into your project, and enjoy a simple and familiar way to store and retrieve.',
                  icon_before: {
                    url: 'https://www.npmjs.com/package/web3.storage',
                    svg: 'npm_icon',
                  },
                  cta: {
                    url: '/docs/reference/js-client-library',
                    text: 'JS DOCS',
                    theme: 'blue',
                    event: '',
                    ui: '',
                    action: '',
                  },
                },
                {
                  type: 'B',
                  label: 'HTTP API',
                  feature:
                    "<span class='highlight'>curl -X</span> POST <span class='highlight'>—data-binary</span> “@foo.gif” https://api.web3.storage/upload",
                  description:
                    'Test or build your project on any stack, using our easy-to-use HTTP API. web3.storage is as flexible as you need it to be.',
                  icon_before: {
                    url: '/docs/reference/http-api/',
                    text: '{…}',
                  },
                  cta: {
                    url: '/docs/reference/http-api/',
                    text: 'HTTP DOCS',
                    theme: 'blue',
                    event: '',
                    ui: '',
                    action: '',
                  },
                },
                {
                  type: 'B',
                  label: 'Web App',
                  feature: 'Drop file to upload',
                  description:
                    'Upload your files directly through our Web UI to debug and validate web3.storage’s use case for your project.',
                  icon_before: {
                    url: '/login',
                    svg: 'windows_icon',
                  },
                  cta: {
                    url: '/login',
                    text: 'MAKE YOUR FIRST UPLOAD',
                    theme: 'blue',
                    event: '',
                    ui: '',
                    action: '',
                  },
                },
              ],
            }}
          />
        </Column>
      </Sectional>
    </Sectionals>
  );
}
