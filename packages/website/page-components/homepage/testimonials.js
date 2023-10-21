import { Sectionals, Column, Sectional } from '../../components/layout';
import TextBlock from '../../components/textblock/textblock';
import CardListBlock from '../../components/cardlistblock/cardlistblock';
import SliderBlock from '../../components/sliderblock/sliderblock';

export default function Testimonials() {
  return (
    <Sectionals id="testimonials_section">
      <Sectional id="section_testimonials" className="grid">
        <Column className="col-5_md-7_sm-8_mi-10_ti-12 column-1" pushLeft="off-0_sm-2_mi-1_ti-0">
          <TextBlock
            block={{
              format: 'medium',
              heading: 'Trusted by the future',
              description: [
                'web3.storage is the easiest way to enable the decentralized web for anyone, from cutting-edge user-first apps, to traditional products at scale, to hackathon projects.',
                'See what people building the future of the web today have to say, and get started.',
              ],
            }}
          />
        </Column>
      </Sectional>
      <Sectional id="section_testimonials-cards" className="grid">
        <Column className="col-12 column-1">
          <CardListBlock
            block={{
              direction: 'row',
              gap: '1',
              cards: [
                {
                  type: 'C',
                  action: 'link',
                  url: '//www.unrealengine.com/marketplace/en-US/profile/3S+Game+Studio?count=20&sortBy=effectiveDate&sortDir=DESC&start=0',
                  image: '/images/index/testimonial-adam-g.jpg',
                  title: 'Adam G.',
                  subtitle: 'CEO, 3S Game Studio',
                  description:
                    'web3.storage allows us to host Unreal Engine on IPFS. This unlocks a better future for gaming, with their reliable infrastructure enabling more efficient deduplication and delivery of assets and components, and more user-centric games.',
                },
                {
                  type: 'C',
                  action: 'link',
                  url: '//pollinations.ai',
                  image: '/images/index/testimonial-caroline-b.jpg',
                  title: 'Caroline B.',
                  subtitle: 'Co-founder and CEO, Pollinations.AI',
                  description:
                    'We use web3.storage to store all of our AI-generated media, around 12k assets per day and growing 20x monthly! web3.storage’s reliability and scalability for content-addressed file storage makes caching very easy. Our users love the content addressing, which makes it easy to come back to previously generated files and know it hasn’t changed.',
                },
                {
                  type: 'C',
                  action: 'link',
                  url: '//fileverse.io/',
                  image: '/images/index/testimonial-vijay-k.jpg',
                  title: 'Vijay K.',
                  subtitle: 'Co-founder, Fileverse',
                  description:
                    'The web3.storage platform allows us to support a community-supported file sharing & collaboration dApp. Their vision with IPFS and UCANs to enable user-centric apps perfectly aligns with the on-chain future we are creating.',
                },
              ],
            }}
          />
        </Column>
        <Column className="col-12 column-2">
          <SliderBlock
            block={{
              type: 'slider_block',
              cols: {
                num: 'col-12',
              },
              breakpoints: {
                medium: 3,
                small: 2,
                mini: 1,
              },
              slides: [
                {
                  type: 'C',
                  action: 'link',
                  url: '//www.strangemood.org',
                  image: '/images/index/testimonial-jacob-p.jpg',
                  title: 'Jacob P.',
                  subtitle: 'New York, USA',
                  description:
                    "web3.storage enables <span className='description-link'>Strangemood</span> to provide game devs with fast, free, and censorship resistant storage. Their simple SDK and responsive team makes decentralized storage on IPFS easier than even centralized alternatives.",
                },
                {
                  type: 'C',
                  image: '/images/index/testimonial-ryan-w.jpg',
                  title: 'Ryan W.',
                  subtitle: 'Capetown, South Africa',
                  description:
                    "I work pretty much exclusively on Web3 applications, and I'm really impressed with web3.storage. It's almost too easy - I didn't run into any stumbling blocks and had a basic implementation of my project in 30 minutes.",
                },
                {
                  type: 'C',
                  action: 'link',
                  url: '//galacticpunks.io',
                  image: '/images/index/testimonial-frank-j.jpg',
                  title: 'Frank J.',
                  subtitle: 'Toronto, Canada',
                  description:
                    "web3.storage was so simple to hook into, and does what you need it to do. We run the <span className='description-link'>Galactic Punks</span> community on Terra, and it is great for storing off-chain data. It's like simplified S3 for IPFS.",
                },
              ],
            }}
          />
        </Column>
      </Sectional>
    </Sectionals>
  );
}
