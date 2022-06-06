import Img from '../../components/cloudflareImage.js';
import ImgSquiggle from '../../public/images/illustrations/squiggle.png';
/**
 * @param {any} props
 */
const Squiggle = props => {
  return (
    <div {...props}>
      <Img src={ImgSquiggle} />
    </div>
  );
};

export default Squiggle;
