import { useState } from 'react';

import Img from 'components/cloudflareImage.js';
import GradientBackground from 'components/gradientbackground/gradientbackground.js';
import Scroll2Top from 'components/scroll2top/scroll2top.js';
import ImageCross from 'public/images/illustrations/cross.png';
import ImageCoil from 'public/images/illustrations/coil.png';
import ImageCorkscrew from 'public/images/illustrations/corkscrew.png';
import ImageTriangle from 'public/images/illustrations/triangle.png';
import ImageTriangle1 from 'public/images/illustrations/triangle1.png';
import BlobCluster from 'public/images/illustrations/blob-cluster.png';
import Cluster1 from 'public/images/index/cluster-1.png';
import Button from 'ZeroComponents/button/button';
import GeneralPageData from '../content/pages/general.json';
import EnterpriseTierRequestModal from 'components/enterpriseTierRequestModal/enterpriseTierRequestModal';
import CardListBlock from 'components/cardlistblock/cardlistblock';
import { saEvent } from 'lib/analytics';

const logos = [
  { src: 'nft-storage.png', alt: 'NFT Storage' },
  { src: 'protocol-labs-logo-black.svg', alt: 'Protocol Labs' },
  { src: 'filecoin.png', alt: 'Filecoin' },
  { src: 'fileverse.png', alt: 'Fileverse' },
  { src: '3sStudio.png', alt: '3sStudio' },
  { src: 'glitter.png', alt: 'Glitter' },
  { src: 'fleek.png', alt: 'Fleek' },
  { src: 'pollinationsai.png', alt: 'Pollinations AI' },
  { src: 'opensea.png', alt: 'OpenSea' },
  { src: 'magic-eden.png', alt: 'magic eden' },
  { src: 'rarible.svg', alt: 'Rarible' },
  { src: 'NFTPort.png', alt: 'NFTPort' },
  { src: 'metaplex.png', alt: 'Metaplex' },
  { src: 'project-galaxy.png', alt: 'Project Galaxy' },
  { src: 'tatum.png', alt: 'Tatum' },
  { src: 'teia.png', alt: 'Teia' },
  { src: 'holaplex.svg', alt: 'Holaplex' },
];

const PricingHeader = () => (
  <>
    <section id="section_pricing_header" className="sectional">
      <div className="grid-middle">
        <div className="col-10_sm-8_mi-10_ti-12 column-1">
          <div className="column-content">
            <div id="intro_1-hero-corkscrew">
              <Img alt="" src={ImageCorkscrew} />
            </div>
            <div id="intro_1-coil">
              <Img alt="" src={ImageCoil} />
            </div>
            <div id="intro_1-cross">
              <Img alt="" src={ImageCross} />
            </div>
            <div className="block text-block format__header">
              <h1 className="h1 heading">Storage that grows with you</h1>
              <div className="description">
                <p>
                  web3.storage is designed for scale and simplicity. Utilize our elastic, hosted data platform that
                  natively integrates decentralized data and authentication protocols. No need to worry about
                  performance or reliability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section id="section_trusted_by_header" className="sectional">
      <div className="grid-middle">
        <div className="col-10_sm-8_mi-10_ti-12 column-1">
          <div className="column-content">
            <div className="block text-block format__medium">
              <div className="subheading">TRUSTED BY</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section id="section_trusted_by_logos" className="sectional">
      <div className="grid-middle">
        <div className="wrapping-logos carousel">
          <div className="wrapping-logos-inner">
            <div className="wrapping-logos-images">
              {logos.map(logo => (
                <div key={logo.alt} className="block image-block">
                  <Img src={`/images/logos/${logo.src}`} alt={logo.alt} layout="fill" />
                </div>
              ))}
              {/* repeat the set for continous css-only scroll */}
              {logos.map(logo => (
                <div key={logo.alt} className="block image-block">
                  <Img src={`/images/logos/${logo.src}`} alt={logo.alt} layout="fill" />
                </div>
              ))}
            </div>
          </div>
          <div id="intro_1-triangle_left">
            <Img alt="" src={ImageTriangle1} />
          </div>
          <div id="intro_1-triangle_right">
            <Img alt="" src={ImageTriangle} />
          </div>
          <div id="intro_1-cross_right">
            <Img alt="" src={ImageCross} />
          </div>
        </div>
      </div>
    </section>
  </>
);

const Card = props => {
  const { title, price, isBestValue, children, storageAllocation, storageOverageRate, callToAction, callToActionUrl } =
    props;
  return (
    <div className="pricing-card">
      {!!isBestValue && <div className="best-value-adornment">Best Value!</div>}
      <div className={`pricing-card-body${isBestValue ? ' adorned' : ''}`}>
        <div className="pricing-title-row">
          <div className="pricing-title">{title}</div>
          <div className="pricing-price">
            {price}
            <div className="pricing-price-term">/mo</div>
          </div>
        </div>
        <ul className="plan-details">{children}</ul>
        <div className="plan-summary">
          <div className="plan-storage-allocation">{storageAllocation}</div>
          <div className="plan-overage-rate">{storageOverageRate}</div>
          <a
            href={callToActionUrl}
            onClick={() => {
              saEvent('pricing_card_click', {
                plan: title,
              });
            }}
          >
            <div className="plan-call-to-action button dark Button">{callToAction}</div>
          </a>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line
const PricingTiers = () => {
  const [isEnterpriseRequestModelOpen, setIsEnterpriseRequestModelOpen] = useState(false);

  return (
    <>
      <section id="section_plan_cards" className="sectional">
        <div className="grid-middle">
          <div>
            <div className="column-content">
              <Card
                title="Free"
                price="$0"
                storageAllocation="5GiB storage"
                storageOverageRate=""
                callToAction="GET STARTED"
                callToActionUrl="/account/payment?plan=free"
              >
                <li className="pricing-bullet-1">Easily store your data and make it available on IPFS</li>
                <li className="pricing-bullet-2">
                  All data is replicated onto the Filecoin storage network for verifiability that your data is safe
                </li>
                <li className="pricing-bullet-3">
                  Use the platform&apos;s other services like w3name and w3link to build the next generation of apps
                </li>
              </Card>

              <Card
                title="Lite"
                price="$3"
                storageAllocation="30GiB storage"
                storageOverageRate="+ $0.10/mo per additional GiB"
                callToAction="CHOOSE THIS PLAN"
                callToActionUrl="/account/payment?plan=lite"
              >
                <li className="pricing-bullet-1">
                  <i>Everything from the Free tier, plus...</i>
                </li>
                <li className="pricing-bullet-2">
                  Additional storage for personal usage or projects requiring lower data volumes
                </li>
              </Card>

              <Card
                title="Expert"
                price="$10"
                isBestValue={true}
                storageAllocation="120GiB storage"
                storageOverageRate="+ $0.08/mo per additional GiB"
                callToAction="CHOOSE THIS PLAN"
                callToActionUrl="/account/payment?plan=pro"
              >
                <li className="pricing-bullet-1">
                  <i>Everything from the Lite tier, plus...</i>
                </li>
                <li className="pricing-bullet-2">
                  Our lowest tier price per GiB stored for use cases that require scale
                </li>
                <li className="pricing-bullet-3">
                  Early access to additional products that make web3 production-ready
                </li>
              </Card>
            </div>
          </div>
        </div>
        <div className="grid-middle">
          <div className="col-12_sm-12_mi-12_ti-12 column-1">
            <div className="column-content">
              <div className="pricing-enterprise-users">
                <div className="enterprise-blob">
                  <Img alt="" src={BlobCluster} />
                </div>
                <div className="enterprise-content">
                  <div className="enterprise-title">FOR ENTERPRISE USERS...</div>
                  <div className="enterprise-heading">Custom</div>
                  <div className="enterprise-description">
                    Looking for way more? Anticipate having a complex integration? Just tell us more about your company
                    and what you&apos;re building using the form below, and we&apos;ll get back to you shortly.
                  </div>
                  <div className="enterprise-above-call-to-action"></div>
                  <div>
                    <Button
                      onClick={() => setIsEnterpriseRequestModelOpen(true)}
                      className="button outline-light enterprise-call-to-action"
                    >
                      LET&apos;S CHAT
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EnterpriseTierRequestModal
          isOpen={isEnterpriseRequestModelOpen}
          onClose={() => setIsEnterpriseRequestModelOpen(false)}
        />
      </section>
    </>
  );
};

const FaqSection = () => (
  <>
    <div className="sectionals" id="tiered_pricing_section_2">
      <section id="tiered_pricing_section_FAQ_info" className="sectional">
        <div className="grid-middle">
          <div className="col-6_sm-8_mi-10_ti-12 column-1" data-push-left="off-0_sm-2_mi-1_ti-0">
            <div className="column-content">
              <div className="block text-block format__medium">
                <h2 className="h2 heading">Frequently Asked Questions</h2>
                <div className="subheading">
                  What advantages does web3.storage have over other IPFS hosted services?
                </div>
                <div className="description">
                  <p>
                    web3.storage runs on Elastic IPFS, an open-source, cloud-native, highly scalable implementation of
                    IPFS. We wrote it as the solution to address increasing adoption of web3.storage, which previously
                    used kubo and IPFS Cluster. As a result, web3.storage is designed to give strong performance and
                    reliability regardless of how much data is being stored on it, meaning that you can rely on it as
                    you and web3.storage grow. And all data is backed up in Filecoin storage deals, which gives
                    cryptographic proof that your data is physically being stored without needing to trust web3.storage.
                  </p>
                  <p>
                    Further, the platform provides other best-in-class implementations of IPFS on performant
                    infrastructure, from w3link, our IPFS HTTP gateway that can be up to 10x faster than other public
                    gateways, to w3name, a hosted service for dynamic data use cases.
                  </p>
                </div>
                <Button className="button light cta" href="/faq/?section=service">
                  MORE FAQs
                </Button>
              </div>
            </div>
          </div>
          <div className="col-5_sm-8_mi-10_ti-12 column-2">
            <div className="column-content">
              <Img alt="" src={Cluster1} />
              <div className="card type__F">
                <div className="label">FAQ</div>
                <div className="title">
                  How do I store data on web3.storage that is already available over the IPFS network without having to
                  download and reupload it myself?
                </div>
                <div className="description height-standard-target">
                  <span>
                    Paid web3.storage plans give users access to our implementation of the Pinning Service API, which
                    allows you to store data on web3.storage that is already available over the IPFS network.
                  </span>
                </div>
                <Button className="button text-purple cta" href="/faq/?section=service">
                  READ MORE
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="section_testimonials" className="sectional">
        <div className="grid">
          <div className="col-12 column-1">
            <div className="column-content">
              <CardListBlock
                block={{
                  direction: 'row',
                  gap: '1',
                  cards: [
                    {
                      type: 'C',
                      action: 'link',
                      url: '//glitterprotocol.io/',
                      image: '/images/index/testimonial-ted-l.jpg',
                      title: 'Ted L.',
                      subtitle: 'CEO, Glitter Protocol',
                      description:
                        'We’ve used web3.storage to store dozens of terabytes of data, make it available on IPFS, and back it up on Filecoin decentralized storage. We would not have been able to index and content address this level of data volume so easily without it.',
                    },
                    {
                      type: 'C',
                      image: '/images/index/testimonial-ryan-w.jpg',
                      title: 'Ryan W.',
                      subtitle: 'Developer, Cape Town',
                      description:
                        "I work pretty much exclusively on Web3 applications, and I'm really impressed with web3.storage. It's almost too easy - I didn't run into any stumbling blocks and had a basic implementation of my project in 30 minutes.",
                    },
                    {
                      type: 'C',
                      action: 'link',
                      url: '//galacticpunks.io',
                      image: '/images/index/testimonial-frank-j.jpg',
                      title: 'Frank J.',
                      subtitle: 'Developer, Toronto',
                      description:
                        "web3.storage was so simple to hook into, and does what you need it to do. We run the <span className='description-link'>Galactic Punks</span> community on Terra, and it is great for storing off-chain data. It's like simplified S3 for IPFS.",
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      </section>
      <section id="section_FAQ_ctas" className="sectional">
        <div className="grid">
          <div className="col-6_sm-6_mi-6_ti-6 column-1"></div>
        </div>
      </section>
    </div>
  </>
);

const LinkSection = () => (
  <div className="sectionals" id="tiered_pricing_section_3">
    <section id="section_explore-docs" className="sectional">
      <div className="grid-noGutter">
        <div className="col-3_md-7_ti-8 column-1" data-push-left="off-0_md-1_sm-0">
          <div className="column-content">
            <div className="block text-block format__medium">
              <h2 className="h2 heading">Open product. Open book.</h2>
              <div className="button dark cta Button">
                <button className="button-contents" type="button">
                  EXPLORE DOCS
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-8_md-10_sm-12_mi-10 column-2" data-push-left="off-1_md-1_sm-0_mi-1">
          <div className="column-content">
            <div className="block card-list-block">
              <div className="card-row gap-2">
                <div className="card type__D">
                  <div className="feature-wrapper">
                    <div className="category">
                      <div className="category-heading">Welcome</div>
                      <a className="category-link" tabIndex={0} href="/docs/#quickstart">
                        Quickstart
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/#create-an-account">
                        Create an Account
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/#get-an-api-token">
                        Get an API token
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/#create-the-upload-script">
                        Create the Upload Script
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/#run-the-script">
                        Run the Script
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/#get-your-file">
                        Get your file
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/#next-steps">
                        Next Steps
                      </a>
                    </div>
                    <div className="category">
                      <div className="category-heading">Concepts</div>
                      <a className="category-link" tabIndex={0} href="/docs/concepts/content-addressing/">
                        Content Addressing
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/concepts/decentralized-storage/">
                        Decentralized Storage
                      </a>
                    </div>
                  </div>
                </div>
                <div className="card type__D">
                  <div className="feature-wrapper">
                    <div className="category">
                      <div className="category-heading">How-tos</div>
                      <a className="category-link" tabIndex={0} href="/docs/how-tos/store/">
                        Store
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/how-tos/retrieve/">
                        Retrieve
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/how-tos/query/">
                        Query
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/how-tos/list/">
                        List
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/how-tos/work-with-car-files/">
                        Work with Content
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/how-tos/generate-api-token/">
                        Generate an API Token
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/how-tos/troubleshooting/">
                        Troubleshooting
                      </a>
                    </div>
                    <div className="category">
                      <div className="category-heading">Reference</div>
                      <a className="category-link" tabIndex={0} href="/docs/reference/http-api/">
                        HTTP API Reference
                      </a>
                      <a className="category-link" tabIndex={0} href="/docs/reference/js-client-library/">
                        Javascript Client Library
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-3 column-3">
          <div className="column-content">
            <div className="block text-block format__medium">
              <h2 className="h2 heading">Open product. Open book.</h2>
              <div className="button dark cta Button">
                <button className="button-contents" type="button">
                  EXPLORE DOCS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default function Home() {
  return (
    <>
      <main className="page page-pricing">
        <div className="sectionals" id="tiered_pricing_section_1">
          <GradientBackground variant="light" />
          <PricingHeader />
          {/* <PricingTiers /> */}
        </div>
        <FaqSection />
        <LinkSection />
      </main>

      <Scroll2Top />
    </>
  );
}

export function getStaticProps() {
  const crumbs = GeneralPageData.breadcrumbs;
  return {
    props: {
      title: 'Pricing - Web3 Storage - Simple file storage with IPFS & Filecoin',
      description:
        'web3.storage is a service that grows with your needs, and offers a significant free tier with no strings attached.',
      breadcrumbs: [crumbs.index, crumbs.pricing],
    },
  };
}
