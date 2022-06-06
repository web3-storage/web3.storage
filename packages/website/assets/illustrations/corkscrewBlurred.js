import Img from '../../components/cloudflareImage.js';
import ImgCorkscrewBlurred from '../../public/images/illustrations/corkscrewBlurred.png';

/**
 * @param {any} props
 */
const CorkscrewBlurred = props => (
  <div className="corkscrew-background" {...props}>
    <Img src={ImgCorkscrewBlurred} />
  </div>
);

export default CorkscrewBlurred;
