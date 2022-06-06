import Img from '../../components/cloudflareImage.js';
import ImgFidget from '../../public/images/illustrations/fidget.png';

/**
 * @param {any} props
 */
const Fidget = props => (
  <div {...props}>
    <Img alt="" src={ImgFidget} />
  </div>
);

export default Fidget;
