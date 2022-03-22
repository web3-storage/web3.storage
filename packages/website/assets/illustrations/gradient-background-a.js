// @ts-ignore
import image from '../images/holographic-bg-cropped-1.png';
/**
 * @param {any} props
 */
const GradientBackgroundA = props => (
  <div {...props}>
    <img className="gradient-background-image-cover" src={image.src} alt="gradient-background" />
  </div>
);

export default GradientBackgroundA;
