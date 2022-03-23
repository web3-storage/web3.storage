import * as React from 'react';

const InfoAIcon = props => (
  <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 10 10" {...props}>
    <g opacity={0.75}>
      <path d="M4.519 0A4.519 4.519 0 1 1 0 4.519 4.519 4.519 0 0 1 4.519 0Z" fill="#fff" />
      <text
        transform="translate(3.019 6.184)"
        fill="#131721"
        stroke="rgba(0,0,0,0)"
        strokeWidth={2}
        fontSize={5}
        fontFamily="Helvetica"
      >
        <tspan x={0} y={0}>
          {'?'}
        </tspan>
      </text>
    </g>
  </svg>
);

export default InfoAIcon;
