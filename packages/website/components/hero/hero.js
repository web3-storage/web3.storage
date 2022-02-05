// ===================================================================== Imports
import TextBlock from '../textblock/textblock';
import Grid3D from '../../assets/illustrations/grid3D';
import Squiggle from '../../assets/illustrations/squiggle';
import Corkscrew from '../../assets/illustrations/corkscrew';
import Helix from '../../assets/illustrations/helix';
import Zigzag from '../../assets/illustrations/zigzag';
import Cross from '../../assets/illustrations/cross';
import Coil from '../../assets/illustrations/coil';
import Triangle from '../../assets/illustrations/triangle';
import Cluster from '../../assets/illustrations/cluster';
import ClusterMobile from '../../assets/illustrations/cluster2';
import Ring from '../../assets/illustrations/ring';
import Spring from '../../assets/illustrations/spring';
import Cone from '../../assets/illustrations/cone';
import Fidget from '../../assets/illustrations/fidget';
import Blobs from '../../assets/illustrations/blobs';

// ====================================================================== Params
/**
 * @param {Object} props.block
 */
// ====================================================================== Export
export default function Hero({ block }) {
  const page = block.page || '';
  // ================================================================= Functions
  const hero404 = () => {
    return (
      <>
        <Grid3D id="error_hero-grid-3d" />
        <Helix id="error_hero-helix" className={'hero-illustration'} />
        <Triangle id="error_hero-triangle-1" className={'hero-illustration'} />
        <Triangle id="error_hero-triangle-2" className={'hero-illustration'} />
        <Triangle id="error_hero-triangle-3" className={'hero-illustration'} />
        <Cross id="error_hero-cross-1" className={'hero-illustration'} />
        <Cross id="error_hero-cross-2" className={'hero-illustration'} />
        <Corkscrew id="error_hero-corkscrew" className={'hero-illustration'} />
        <Ring id="error_hero-ring" className={'hero-illustration'} />
        <Spring id="error_hero-spring" className={'hero-illustration'} />
      </>
    );
  };

  const faqHero = () => {
    return (
      <>
        <Grid3D id="faq_hero-grid-3d" />
        <Corkscrew id="faq_hero-corkscrew" className={'hero-illustration'} />
        <Helix id="faq_hero-helix" className={'hero-illustration'} />
        <Ring id="faq_hero-ring" className={'hero-illustration'} />
      </>
    );
  };

  const aboutHero = () => {
    return (
      <>
        <Cluster id="about_hero-cluster" className={'hero-illustration'} />
        <ClusterMobile id="about_hero-cluster-mobile" />
        <Blobs id="about_hero-blobs" className={'hero-illustration'} />
        <Ring id="about_hero-ring" className={'hero-illustration'} />
        <Helix id="about_hero-helix" className={'hero-illustration'} />
        <Spring id="about_hero-spring" className={'hero-illustration'} />
        <Cone id="about_hero-cone" className={'hero-illustration'} />
        <Fidget id="about_hero-fidget" className={'hero-illustration'} />
      </>
    );
  };

  const tiersHero = () => {
    return (
      <>
        <Coil id="pricing_hero-coil" className={'hero-illustration'} />
        <Corkscrew id="pricing_hero-corkscrew" className={'hero-illustration'} />
        <Cross id="pricing_hero-cross" className={'hero-illustration'} />
      </>
    );
  };

  const indexHero = () => {
    return (
      <>
        <div id="index_hero_background-gradient"></div>
        <Grid3D id="index_hero-grid-3d" />
        <Squiggle id="index_hero-squiggle" className={'hero-illustration'} />
        <Corkscrew id="index_hero-corkscrew" className={'hero-illustration'} />
        <Zigzag id="index_hero-zigzag" className={'hero-illustration'} />
        <Helix id="index_hero-helix" className={'hero-illustration'} />
        <Cross id="index_hero-cross" className={'hero-illustration'} />
        <Triangle id="index_hero-triangle" className={'hero-illustration'} />
      </>
    );
  };

  const getPageHeroHeader = string => {
    switch (string) {
      case 'index':
        return indexHero();
      case 'pricing':
        return tiersHero();
      case 'about':
        return aboutHero();
      case 'faq':
        return faqHero();
      case 'error':
        return hero404();
      default:
        return null;
    }
  };

  // ==================================================== Template [Hero Header]
  return (
    <div id={`${page}_hero-container`}>
      <div className={`${page}_hero-top-section`}>
        <div className={`${page}_hero-artwork-container`}>{getPageHeroHeader(page)}</div>

        <TextBlock block={block} />
      </div>
    </div>
  );
}
