// ===================================================================== Imports
import TextBlock from '../textblock/textblock';
import HeroIllustration from '../../components/hero-illustration';
import Grid3D from '../../assets/illustrations/grid3D';
import ImageSquiggle from '../../public/images/illustrations/squiggle.png';
import ImageHelix from '../../public/images/illustrations/helix.png';
import ImageZigzag from '../../public/images/illustrations/zigzag.png';
import ImageCross from '../../public/images/illustrations/cross.png';
import ImageCoil from '../../public/images/illustrations/coil.png';
import ImageTriangle from '../../public/images/illustrations/triangle.png';
import ImageCluster from '../../public/images/illustrations/cluster.png';
import ImageClusterMobile from '../../public/images/illustrations/cluster2.png';
import ImageCone from '../../public/images/illustrations/cone.png';
import ImageFidget from '../../public/images/illustrations/fidget.png';
import ImageCorkscrew from '../../public/images/illustrations/corkscrew.png';
import ImageRing from '../../public/images/illustrations/ring.png';
import ImageSpring from '../../public/images/illustrations/spring.png';
import ImageBlobs from '../../public/images/illustrations/blobs.png';
import ImageCross2 from '../../public/images/illustrations/cross2.png';

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
        <HeroIllustration id="error_hero-helix" src={ImageHelix} />
        <HeroIllustration id="error_hero-triangle-1" src={ImageTriangle} />
        <HeroIllustration id="error_hero-triangle-2" src={ImageTriangle} />
        <HeroIllustration id="error_hero-triangle-3" src={ImageTriangle} />
        <HeroIllustration id="error_hero-cross-1" src={ImageCross} />
        <HeroIllustration id="error_hero-cross-2" src={ImageCross} />
        <HeroIllustration id="error_hero-corkscrew" src={ImageCorkscrew} />
        <HeroIllustration id="error_hero-ring" src={ImageRing} />
        <HeroIllustration id="error_hero-spring" src={ImageSpring} />
      </>
    );
  };

  const faqHero = () => {
    return (
      <>
        <Grid3D id="faq_hero-grid-3d" />
        <HeroIllustration id="faq_hero-corkscrew" src={ImageCorkscrew} />
        <HeroIllustration id="faq_hero-helix" src={ImageHelix} />
        <HeroIllustration id="faq_hero-ring" src={ImageRing} />
      </>
    );
  };

  const aboutHero = () => {
    return (
      <>
        <HeroIllustration id="about_hero-cluster" src={ImageCluster} />
        <HeroIllustration id="about_hero-cluster-mobile" src={ImageClusterMobile} />
        <HeroIllustration id="about_hero-blobs" src={ImageBlobs} />
        <HeroIllustration id="about_hero-ring" src={ImageRing} />
        <HeroIllustration id="about_hero-helix" src={ImageHelix} />
        <HeroIllustration id="about_hero-spring" src={ImageSpring} />
        <HeroIllustration id="about_hero-cone" src={ImageCone} />
        <HeroIllustration id="about_hero-fidget" src={ImageFidget} />
      </>
    );
  };

  const tiersHero = () => {
    return (
      <>
        <HeroIllustration id="pricing_hero-coil" src={ImageCoil} />
        <HeroIllustration id="pricing_hero-corkscrew" src={ImageCorkscrew} />
        <HeroIllustration id="pricing_hero-cross" src={ImageCross} />
      </>
    );
  };

  const w3nameHero = () => {
    return (
      <>
        <Grid3D id="w3name_hero-grid-3d" />
      </>
    );
  };

  const indexHero = () => {
    return (
      <>
        <Grid3D id="index_hero-grid-3d" />
        <HeroIllustration id="index_hero-squiggle" src={ImageSquiggle} />
        <HeroIllustration id="index_hero-corkscrew" src={ImageCorkscrew} />
        <HeroIllustration id="index_hero-zigzag" src={ImageZigzag} />
        <HeroIllustration id="index_hero-cross" src={ImageCross} />
        <HeroIllustration id="index_hero-triangle" src={ImageTriangle} />
      </>
    );
  };

  const contactHero = () => {
    return (
      <>
        <HeroIllustration id="contact_hero-corkscrew" src={ImageCorkscrew} />
        <HeroIllustration id="contact_hero-helix" src={ImageHelix} />
        <HeroIllustration id="contact_hero-helix2" src={ImageHelix} />
        <HeroIllustration id="contact_hero-cross" src={ImageCross2} />
        <HeroIllustration id="contact_hero-triangle" src={ImageTriangle} />
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
      case 'w3name':
        return w3nameHero();
      case 'error':
        return hero404();
      case 'contact':
        return contactHero();
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
