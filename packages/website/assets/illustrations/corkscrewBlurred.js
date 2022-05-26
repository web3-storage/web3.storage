import Img from 'components/cloudflareImage';

/**
 * @param {any} props
 */
const CorkscrewBlurred = props => (
  <div className="corkscrew-background" {...props}>
    <Img
      width="800"
      height="800"
      className="image-full-width"
      src="/images/illustrations/corkscrewBlurred.png"
      alt="background"
    />
  </div>
);

export default CorkscrewBlurred;
