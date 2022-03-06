// @ts-ignore
import image from '../images/holographic-bg-cropped-2.png';
/**
 * @param {any} props
 */
const GradientBackgroundC = props => (
  <div {...props}>
    <img className="gradient-background-image-cover" src={image.src} alt="gradient-background" />
  </div>
);

export default GradientBackgroundC;
