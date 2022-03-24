const Spinner = props => (
  <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="spinner-gradient">
        <stop offset="0%" stopColor="#D726D7" />
        <stop offset="50%" stopColor="#3064E0" />
        <stop offset="100%" stopColor="#31E7EA" />
      </linearGradient>
      <path
        id="spinner"
        d="M25 5a20.14 20.14 0 0 1 20 17.88 2.51 2.51 0 0 0 2.49 2.26A2.52 2.52 0 0 0 50 22.33a25.14 25.14 0 0 0-50 0 2.52 2.52 0 0 0 2.5 2.81A2.51 2.51 0 0 0 5 22.88 20.14 20.14 0 0 1 25 5Z"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="0.75s"
          repeatCount="indefinite"
        />
      </path>
    </defs>
    <use href="#spinner" />
    <use href="#spinner-gradient" />
  </svg>
);

export default Spinner;
