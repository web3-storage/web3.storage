import Img from '../../components/cloudflareImage.js';
import ImgCoil from '../../public/images/illustrations/coil.png';

/**
 * @param {any} props
 */
const Coil = props => (
  <div {...props}>
    <Img alt="" src={ImgCoil} />
  </div>
);

export default Coil;
