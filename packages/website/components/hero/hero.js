// ===================================================================== Imports
import TextBlock from '../textblock/textblock';
import Grid3D from '../../assets/illustrations/grid3D';
import GradientBackground from '../../assets/illustrations/gradient-background';
import Squiggle from '../../assets/illustrations/squiggle';
import Corkscrew from '../../assets/illustrations/corkscrew';
import Helix from '../../assets/illustrations/helix';
import Zigzag from '../../assets/illustrations/zigzag';
import Cross from '../../assets/illustrations/cross';
import Triangle from '../../assets/illustrations/triangle';
import Cluster from '../../assets/illustrations/cluster';

// ====================================================================== Params
/**
 * @param {Object} props.block
 */
// ====================================================================== Export
export default function Hero({ block }) {
  const page = block.page || ''
  // ================================================================= Functions
  const getPageHeroHeader = (string) => {
    switch (string) {
      case 'index' :
        return indexHero()
      case 'pricing' :
        return (<></>);
      case 'about' :
        return (<Cluster id="about_hero-cluster" />);
    }
  }

  const indexHero = () => {
    return (
      <>
        <GradientBackground id="index_hero_background-gradient" />
        <Grid3D id="index_hero-grid-3d" />
        <Squiggle id="index_hero-squiggle" className={"hero-illustration"} />
        <Corkscrew id="index_hero-corkscrew" className={"hero-illustration"} />
        <Zigzag id="index_hero-zigzag" className={"hero-illustration"} />
        <Helix id="index_hero-helix" className={"hero-illustration"} />
        <Cross id="index_hero-cross" className={"hero-illustration"} />
        <Triangle id="index_hero-triangle" className={"hero-illustration"} />
      </>
    )
  }

  // ==================================================== Template [Hero Header]
  return (
    <div id={`${page}_hero-container`}>
      <div className={`${page}_hero-top-section`}>
        <div className={`${page}_hero-artwork-container`}>
          { getPageHeroHeader(page) }
        </div>

        <TextBlock block={block} />
      </div>
    </div>
  );
}
