import { Sectionals, Column, Hero, Sectional } from '../../components/layout';
import Grid3D from '../../assets/illustrations/grid3D';
import HeroIllustration from '../../components/hero-illustration';
import ImageTriangle from '../../public/images/illustrations/triangle.png';
import ImageZigzag from '../../public/images/illustrations/zigzag.png';
import ImageCorkscrew from '../../public/images/illustrations/corkscrew.png';
import ImageSquiggle from '../../public/images/illustrations/squiggle.png';
import ImageCross from '../../public/images/illustrations/cross.png';

export default function HomepageHero() {
  return (
    <Sectionals variant="header" id="hero_section">
      <Sectional id="hero_header" className="grid">
        <Column className="col-12 column-1">
          <Hero
            id="index"
            header={
              <>
                <Grid3D id="index_hero-grid-3d" />
                <HeroIllustration id="index_hero-squiggle" src={ImageSquiggle} />
                <HeroIllustration id="index_hero-corkscrew" src={ImageCorkscrew} />
                <HeroIllustration id="index_hero-zigzag" src={ImageZigzag} />
                <HeroIllustration id="index_hero-cross" src={ImageCross} />
                <HeroIllustration id="index_hero-triangle" src={ImageTriangle} />
              </>
            }
            textBlock={{
              format: 'header',
              heading: 'Say hello to the data layer',
              subheading:
                'Use decentralized protocols to liberate your data using our easy-to-use developer platform. We’ll take care of the rest.',
              cta: {
                url: '/login',
                text: 'START NOW',
                event: '',
                ui: 'HOME_HERO',
                action: 'Get Started',
              },
              cta2: {
                url: 'https://blog.web3.storage/posts/say-hello-to-the-data-layer-1-3-intro-to-web3-storage',
                text: "WHAT'S THE DATA LAYER?",
                event: '',
                ui: 'HOME_HERO',
                action: 'Data Layer Blog Link',
              },
            }}
          />
        </Column>
      </Sectional>
    </Sectionals>
  );
}
