import * as React from 'react';

const SearchIcon = props => (
  <svg xmlns="http://www.w3.org/2000/svg" width={11.5} height={11.5} viewBox="0 0 11.5 11.5" {...props}>
    <g fill="none" stroke="currentColor">
      <g>
        <circle cx={5} cy={5} r={5} stroke="none" />
        <circle cx={5} cy={5} r={4.5} />
      </g>
      <path strokeLinecap="round" d="m8.5 8.5 3 3" />
    </g>
  </svg>
);

export default SearchIcon;
