// @ts-ignore
import triangle from '../images/triangle.png'
/**
 * @param {any} props
 */
 const Triangle = (props) => (
    <div {...props}>
      <img className="image-full-width" alt="" src={triangle.src} />
    </div>
)

export default Triangle
