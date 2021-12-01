import squiggle from '../images/squiggle.png'
/**
 * @param {any} props
 */
 const Squiggle = (props) => (
    <div {...props}>
      <img className="image-full-width" src={squiggle.src} />
    </div>
)

export default Squiggle
