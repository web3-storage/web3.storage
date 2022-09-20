import Img from 'components/cloudflareImage.js';
import GradientBackground from 'components/gradientbackground/gradientbackground.js';
import Scroll2Top from 'components/scroll2top/scroll2top.js';
import ImageCross from 'public/images/illustrations/cross.png';
import ImageCoil from 'public/images/illustrations/coil.png';
import ImageCorkscrew from 'public/images/illustrations/corkscrew.png';
import ImageTriangle from 'public/images/illustrations/triangle.png';
import ImageTriangle1 from 'public/images/illustrations/triangle1.png';

export default function Home() {
  return (
    <>
      <main className="page page-pricing">
        <div className="sectionals" id="pricing_section_1">
          <GradientBackground variant="light" />
          <section id="section_pricing_header" className="sectional">
            <div className="grid-middle">
              <div className="col-10_sm-8_mi-10_ti-12 column-1" data-push-left="off-0_sm-2_mi-1_ti-0">
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
                        Web3.Storage is designed for scale and simplicity. Utilize our elastic, hosted data platform
                        that natively integrates decentralized data and authentication protocols. No need to worry about
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
              <div className="col-10_sm-8_mi-10_ti-12 column-1" data-push-left="off-0_sm-2_mi-1_ti-0">
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
              <div className="col-10_sm-8_mi-10_ti-12 column-1" data-push-left="off-0_sm-2_mi-1_ti-0">
                <div className="column-content">
                  <div className="block image-block">
                    <Img src="/images/logos/nft-storage.svg" alt="NFT Storage" />
                    <div className="image-label"></div>
                  </div>
                  <div className="block image-block">
                    <Img src="/images/logos/protocol-labs.svg" alt="Protocol Labs" />
                    <div className="image-label"></div>
                  </div>
                  <div className="block image-block">
                    <Img src="/images/logos/filecoin.svg" alt="Filecoin" />
                    <div className="image-label"></div>
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
            </div>
          </section>
          <section id="section_plan_cards" className="sectional">
            <div className="grid-middle">
              <div className="col-12_sm-8_mi-10_ti-12 column-1" data-push-left="off-0_sm-2_mi-1_ti-0">
                <div className="column-content">
                  <div className="pricing-card">
                    <div className="pricing-card-body">
                      <div className="pricing-title-row">
                        <div className="pricing-title">Free</div>
                        <div className="pricing-price">
                          $0
                          <div className="pricing-price-term">/month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pricing-card">
                    <div className="pricing-card-body">stuff 2</div>
                  </div>
                  <div className="pricing-card">
                    <div className="best-value-adornment">Best Value!</div>
                    <div className="pricing-card-body adorned">stuff 3</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Scroll2Top />
    </>
  );
}

export function getStaticProps() {
  return {
    props: {
      title: 'Pricing - Web3 Storage - Simple file storage with IPFS & Filecoin',
      description:
        'Web3.Storage is a service that grows with your needs, and offers a significant free tier with no strings attached.',
    },
  };
}
