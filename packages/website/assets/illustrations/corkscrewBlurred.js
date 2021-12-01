import corkscrewBlurred from '../images/corkscrewBlurred.png';
/**
 * @param {any} props
 */
const CorkscrewBlurred = props => (
  <div className="corkscrew-background" {...props}>
    <img className="image-full-width" src={corkscrewBlurred.src} alt="background" />
  </div>
);

export default CorkscrewBlurred;
