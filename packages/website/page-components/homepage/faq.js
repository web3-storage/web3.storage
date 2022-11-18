import { Sectionals, Column, Sectional } from '../../components/layout';
import Img from '../../components/cloudflareImage';
import TextBlock from '../../components/textblock/textblock';
import CardListBlock from '../../components/cardlistblock/cardlistblock';
import ImageBlock from '../../components/imageblock/imageblock';
import ImageSquiggle from '../../public/images/illustrations/squiggle.png';

export default function Faq() {
  return (
    <Sectionals id="faq_section">
      <Sectional id="section_FAQ_info" className="grid-middle">
        <Column className="col-6_sm-8_mi-10_ti-12 column-1" pushLeft="off-0_sm-2_mi-1_ti-0">
          <div id="section_FAQ-squiggle">
            <Img alt="" src={ImageSquiggle} />
          </div>
          <TextBlock
            block={{
              format: 'medium',
              heading: 'Frequently Asked Questions',
              subheading: 'What is meant by the “web3.storage platform”?',
              description: [
                "web3.storage is a suite of APIs and services that make it easy for developers and other users to interact with data in a way that is not tied to where the data is actually physically stored. It natively uses decentralized data and identity protocols like <a href='https://ipfs.tech/'>IPFS</a>, <a href='https://filecoin.io/'>Filecoin</a>, and <a href='https://ucan.xyz/'>UCAN</a> that enable verifiable, data- and user-centric application architectures and workflows. ",
                "At the core of the platform includes a hosted storage service which can be used to upload and persist data to make it continuously available. The platform also contains additional services like <a href='/products/w3link/'>w3link</a> and <a href='/products/w3name/'>w3name</a> that make it easier to create seamless, delightful web experiences utilizing web3 protocols.",
              ],
              cta: {
                url: '/faq',
                text: 'MORE FAQs',
                theme: 'light',
                event: '',
                ui: '',
                action: '',
              },
            }}
          />
        </Column>
        <Column className="col-5_sm-8_mi-10_ti-12 column-2" pushLeft="off-1_sm-2_mi-1_ti-0">
          <ImageBlock
            block={{
              cols: {
                num: 'col-5_sm-8_mi-10_ti-12',
                push_left: 'off-1_sm-2_mi-1_ti-0',
              },
              src: '/images/index/cluster-1.png',
            }}
          />
        </Column>
      </Sectional>
      <Sectional id="section_FAQ_ctas" className="grid">
        <Column className="col-12_sm-8_mi-10_ti-12 column-1" pushLeft="off-0_sm-2_mi-1_ti-0">
          <CardListBlock
            block={{
              direction: 'row',
              gap: '4',
              cards: [
                {
                  type: 'F',
                  label: 'FAQ',
                  title: 'What advantages does web3.storage have over traditional hosted storage services?',
                  description:
                    "Because web3.storage uses decentralized data and identity protocols like <a href='https://ipfs.tech/'>IPFS</a> and <a href='https://ucan.xyz/'>UCAN</a>, data and identity are referenced in an open way. Data is referenced using <a href='https://docs.ipfs.tech/concepts/content-addressing/'>IPFS content identifiers</a> that are unique to the data, making your data...",
                  cta: {
                    url: '/faq/?section=service',
                    text: 'READ MORE',
                    theme: 'text-purple',
                    event: '',
                    ui: '',
                    action: '',
                  },
                },
                {
                  type: 'F',
                  label: ' ',
                  title: 'What advantages does web3.storage have over other IPFS hosted services?',
                  description:
                    "web3.storage runs on <a href='https://github.com/elastic-ipfs/elastic-ipfs'>Elastic IPFS</a>, an open-source, cloud-native, highly scalable implementation of <a href='https://ipfs.tech/'>IPFS</a>. We wrote it as the solution to address increasing adoption of web3.storage, which previously used kubo...",
                  cta: {
                    url: '/faq/?section=data-security',
                    text: 'READ MORE',
                    theme: 'text-purple',
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
