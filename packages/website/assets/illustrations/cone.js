import Img from '../../components/cloudflareImage.js';
import ImgCone from '../../public/images/illustrations/cone.png';

/**
 * @param {any} props
 */
const Cone = props => (
  <div {...props}>
    <Img alt="" src={ImgCone} />
  </div>
);

export default Cone;
