import Img from '../../components/cloudflareImage.js';
import ImgBlobs from '../../public/images/illustrations/holographic-background.png';

/**
 * @param {any} props
 */
export const GradientImage = props => (
  <div {...props}>
    <Img className="image-full-width" src={ImgBlobs} alt="gradient-background" layout="fill" />
  </div>
);
