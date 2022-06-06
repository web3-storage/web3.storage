import Img from '../../components/cloudflareImage.js';
import ImgTriangle from '../../public/images/illustrations/triangle.png';

/**
 * @param {any} props
 */
const Triangle = props => (
  <div {...props}>
    <Img alt="" src={ImgTriangle} />
  </div>
);

export default Triangle;
