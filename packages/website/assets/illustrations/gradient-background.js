// @ts-ignore
import holographic from '../images/holographic-bg.png'
/**
 * @param {any} props
 */
 const GradientBackground = (props) => (
    <div {...props}>
      <img className="image-full-width" alt="background" src={holographic.src} />
    </div>
)

export default GradientBackground
