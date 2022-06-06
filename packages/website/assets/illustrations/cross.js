import Img from '../../components/cloudflareImage.js';
import ImgCross from '../../public/images/illustrations/cross.png';

/**
 * @param {any} props
 */
const Cross = props => (
  <div {...props}>
    <Img alt="" src={ImgCross} />
  </div>
);

export default Cross;
