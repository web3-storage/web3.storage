// @ts-ignore
import image from '../images/holographic-bg-nav-mobile.png';
/**
 * @param {any} props
 */
const GradientBackgroundD = props => (
  <div {...props}>
    <img className="gradient-background-image-cover" src={image.src} alt="gradient-background" />
  </div>
);

export default GradientBackgroundD;
