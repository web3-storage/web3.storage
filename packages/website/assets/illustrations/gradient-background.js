// @ts-ignore
import image from '../images/holographic-background.png';
/**
 * @param {any} props
 */
export const GradientImage = (props) => (
  <div {...props}>
    <img className="image-full-width" src={image.src} alt="gradient-background" />
  </div>
);
