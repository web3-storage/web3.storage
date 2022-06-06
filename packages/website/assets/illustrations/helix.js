import Img from '../../components/cloudflareImage.js';
import ImgHelix from '../../public/images/illustrations/helix.png';

/**
 * @param {any} props
 */
const Helix = props => (
  <div {...props}>
    <Img alt="" src={ImgHelix} />
  </div>
);

export default Helix;
