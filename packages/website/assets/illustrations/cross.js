import cross from '../images/cross.png'
/**
 * @param {any} props
 */
 const Cross = (props) => (
    <div {...props}>
      <img className="image-full-width" src={cross.src} />
    </div>
)

export default Cross
