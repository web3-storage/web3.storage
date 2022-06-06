import Img from '../../components/cloudflareImage.js';
import ImgCorkscrew from '../../public/images/illustrations/corkscrew.png';

/**
 * @param {any} props
 */
const Corkscrew = props => (
  <div {...props}>
    <Img src={ImgCorkscrew} />
  </div>
);

export default Corkscrew;
