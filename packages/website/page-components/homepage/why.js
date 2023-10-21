import { Column, Sectional, Sectionals } from '../../components/layout';
import Img from '../../components/cloudflareImage';
import TextBlock from '../../components/textblock/textblock';
import CardListBlock from '../../components/cardlistblock/cardlistblock';
import ImageTriangle from '../../public/images/illustrations/triangle.png';
import ImageCross from '../../public/images/illustrations/cross.png';

export default function WhySection() {
  return (
    <Sectionals id="why_section" variant="light">
      <Sectional id="why_section-heading" className="grid">
        <Column className="column-1" pushLeft="off-0_sm-1_mi-1_ti-0">
          <div id="why_section-cross">
            <Img alt="" src={ImageCross} />
          </div>
          <TextBlock block={{ format: 'medium', heading: 'web3.storage is built for scale' }} />
          <div id="why_section-triangle">
            <Img alt="" src={ImageTriangle} />
          </div>
        </Column>
      </Sectional>
      <Sectional id="why_section-statistics" className="grid">
        <Column className="col-12_mi-10_ti-12 column-1" pushLeft="off-0_mi-1_ti-0">
          <CardListBlock
            block={{
              direction: 'row',
              gap: '4',
              cards: [
                {
                  type: 'A',
                  feature: '20K+',
                  title: 'Users',
                  description: 'Join a global community<br/> storing data on web3',
                },
                {
                  type: 'A',
                  feature: '40M+',
                  title: 'Stored Objects',
                  description: 'Store data with our easy<br/> to use API or JS library',
                },
                {
                  type: 'A',
                  feature: '60+',
                  title: 'Filecoin Storage Providers',
                  description: 'Data is stored trustlessly across a growing network of storage providers via Filecoin',
                },
              ],
            }}
          />
        </Column>
      </Sectional>
      <Sectional id="why_section-cta" className="grid">
        <Column className="col-5_sm-10_ti-12 column-1" pushLeft="off-0_sm-1_ti-0">
          <TextBlock
            block={{
              format: 'medium',
              heading: 'Why web3.storage?',
              description:
                'With web3.storage you get all the benefits of decentralized storage and other cutting-edge protocols with the frictionless experience you expect in a modern dev workflow. Check out our docs pages to learn more.',
              cta: {
                url: '/docs/',
                text: 'READ DOCS',
                tracking: '',
                event: '',
                ui: '',
                action: '',
              },
            }}
          />
        </Column>
        <Column className="col-6_sm-10_ti-12 column-2" pushLeft="off-1_sm-1_ti-0">
          <TextBlock
            block={{
              format: 'small',
              heading: 'Open',
              description:
                'All data is accessible via IPFS and backed by Filecoin storage, with service authentication using decentralized identity. Create user-centric applications, run verifiable workloads on data, and more - no servers needed, no lock-in, no trust necessary.',
            }}
          />
          <TextBlock
            block={{
              format: 'small',
              heading: 'Reliable',
              description:
                'We take the best of web2 and web3 to provide infra you can rely on to scale with you. Frustration with decentralized storage is a thing of the past.',
            }}
          />
          <TextBlock
            block={{
              format: 'small',
              heading: 'Simple',
              description:
                'Start storing in minutes using our simple client library to see how decentralized protocols can work together to unlock your data layer.',
            }}
          />
        </Column>
      </Sectional>
    </Sectionals>
  );
}
