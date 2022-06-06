import Img from './cloudflareImage.js';

/**
 * Hero Illustration Component
 *
 * @param {Object} props
 * @param {string | import('./cloudflareImage.js').ImageImport} props.src
 * @param {string} props.id - Wrapper id
 * @param {string} [props.className] - Wrapper classname. Defaults: 'hero-illustration'
 * @param {boolean} [props.priority] - Image priority
 */
const HeroIllustration = props => (
  <div id={props.id} className={props.className || 'hero-illustration'}>
    <Img alt="" src={props.src} priority={props.priority || true} />
  </div>
);

export default HeroIllustration;
