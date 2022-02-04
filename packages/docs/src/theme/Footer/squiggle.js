import React from 'react';
import squiggle from '../../../static/img/shapes/squiggle.png'

 const Squiggle = (props) => (
    <div {...props}>
      <img className="image-full-width" src={squiggle.src} />
    </div>
)

export default Squiggle
