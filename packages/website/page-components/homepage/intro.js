import { Sectionals, Column, Sectional } from '../../components/layout';
import Img from '../../components/cloudflareImage';
import TextBlock from '../../components/textblock/textblock';
import CodePreview from '../../components/codepreview/codepreview';
import ImageHelix from '../../public/images/illustrations/helix.png';
import ImageCoil from '../../public/images/illustrations/coil.png';
import ImageCross from '../../public/images/illustrations/cross.png';

export default function Intro() {
  return (
    <Sectionals id="intro_section">
      <Sectional id="intro" className="grid">
        <Column className="col-5_sm-8_mi-10_ti-12 column-1" pushLeft="off-0_sm-2_mi-1_ti-0">
          <div id="intro-coil">
            <Img alt="" src={ImageCoil} />
          </div>
          <div id="intro-cross">
            <Img alt="" src={ImageCross} />
          </div>
          <TextBlock
            block={{
              format: 'medium',
              heading: 'Connecting services with the data layer',
              description: [
                'Eliminate silos with the web3.storage platform. Using IPFS and other decentralized protocols, create a true data layer that connects you, your users, and the Web, regardless of where content is stored - client-side, in the cloud, or elsewhere.',
                'Sounds hard? It isn’t. Our client libraries are super easy-to-use, abstracting the complexity of these decentralized protocols. And we provide services like data storage designed to natively support these protocols, so things just work without you ever being locked-in.',
              ],
              cta: {
                url: '/products/web3storage',
                text: 'LEARN MORE',
                theme: 'light',
                event: '',
                ui: '',
                action: '',
              },
            }}
          />
        </Column>
        <Column className="col-6_sm-8_mi-10_ti-12 column-2" pushLeft="off-1_sm-2_mi-1_ti-0">
          <div id="intro-helix">
            <Img alt="" src={ImageHelix} />
          </div>
          <CodePreview
            block={{
              type: 'code_preview',
              tabs: [
                {
                  thumb: 'STORE',
                  lines: [
                    '// store.mjs',
                    '',
                    "import { Web3Storage, getFilesFromPath } from 'web3.storage'",
                    '',
                    'const token = process.env.API_TOKEN',
                    'const client = new Web3Storage({ token })',
                    '',
                    'async function storeFiles () {',
                    "  const files = await getFilesFromPath('/path/to/file')",
                    '  const cid = await client.put(files)',
                    '  console.log(cid)',
                    '}',
                    '',
                    'storeFiles()',
                  ],
                  output: {
                    label: 'Run it with',
                    value: 'npm i web3.storage\nAPI_TOKEN=YOUR_TOKEN node ./store.mjs',
                  },
                },
                {
                  thumb: 'READ',
                  lines: [
                    '// retrieve.mjs',
                    '',
                    "import { Web3Storage, getFilesFromPath } from 'web3.storage'",
                    '',
                    'const token = process.env.API_TOKEN',
                    'const client = new Web3Storage({ token })',
                    '',
                    'async function retrieveFiles () {',
                    '  const cid =',
                    "     'bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu'",
                    '',
                    '  const res = await client.get(cid)',
                    '  const files = await res.files()',
                    '',
                    '  for (const file of files) {',
                    '    console.log(`${file.cid}: ${file.name} (${file.size} bytes)`)',
                    '  }',
                    '}',
                    '',
                    'retrieveFiles()',
                  ],
                  output: {
                    label: 'Run it with',
                    value: 'npm i web3.storage\nAPI_TOKEN=YOUR_TOKEN node ./retrieve.mjs',
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
