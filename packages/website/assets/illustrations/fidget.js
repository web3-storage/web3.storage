import Img from 'components/cloudflareImage';

/**
 * @param {any} props
 */
const Fidget = props => (
  <div {...props}>
    <Img height="480" width="480" className="image-full-width" alt="" src="/images/illustrations/fidget.png" />
  </div>
);

export default Fidget;
