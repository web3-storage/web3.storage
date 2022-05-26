import Img from 'components/cloudflareImage';

/**
 * @param {any} props
 */
const Squiggle = props => (
  <div {...props}>
    <Img className="image-full-width" alt="" src="/images/illustrations/squiggle.png" width="464" height="464" />
  </div>
);

export default Squiggle;
