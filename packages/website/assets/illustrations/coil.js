import coil from '../images/coil.png'
/**
 * @param {any} props
 */
 const Coil = (props) => (
    <div {...props}>
      <img className="image-full-width" src={coil.src} />
    </div>
)

export default Coil
