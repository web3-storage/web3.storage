import Terms from '../content/service-level-agreement.mdx';
import Img from '../components/cloudflareImage.js';
import ImageTriangle from '../public/images/illustrations/triangle.png';
import ImageHelix from '../public/images/illustrations/helix.png';
import ImageCross from '../public/images/illustrations/cross.png';
import ImageRing from '../public/images/illustrations/ring.png';
import ImageCoil from '../public/images/illustrations/coil.png';
import GeneralPageData from '../content/pages/general.json';

export default function Home() {
  return (
    <main className="page page-sla">
      <div className="grid">
        <div>
          <section id="sla_page-main-body" className="sectional">
            <div id={'sla_page_helix'}>
              <Img alt="" src={ImageHelix} />
            </div>
            <div id={'sla_page_triangle'}>
              <Img alt="" src={ImageTriangle} />
            </div>
            <div id={'sla_page_cross'}>
              <Img alt="" src={ImageCross} />
            </div>
            <div id={'sla_page_ring'}>
              <Img alt="" src={ImageRing} />
            </div>
            <div id={'sla_page_coil'}>
              <Img alt="" src={ImageCoil} />
            </div>
            <Terms />
          </section>
        </div>
      </div>
    </main>
  );
}

export function getStaticProps() {
  const crumbs = GeneralPageData.breadcrumbs;
  return {
    props: {
      title: 'Service Level Agreement - Web3 Storage - Simple file storage with IPFS & Filecoin',
      description: 'Service Level Agreement (SLA) for web3.storage.',
      breadcrumbs: [crumbs.index, crumbs.sla],
    },
  };
}
