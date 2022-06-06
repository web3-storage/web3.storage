import Img from '../../components/cloudflareImage.js';
import ImgBlobs from '../../public/images/illustrations/blobs.png';

/**
 * @param {any} props
 */
const Blobs = props => (
  <div {...props}>
    <Img alt="" src={ImgBlobs} />
  </div>
);

export default Blobs;
