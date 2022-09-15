// ===================================================================== Imports
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

import useDebounce from '../../hooks/useDebounce';
// ====================================================================== Params
/**
 * @param {Object} props
 * @param {Array} props.collection
 * @param {boolean} props.arrowSelectors
 * @param {boolean} props.rangeInput
 * @param {number} props.rows
 * @param {Object} props.displayOptions
 */
// =================================================================== Functions

/**
 * @param {any} props TODO: Define props
 */
function Content({}) {
  return null;
}

/**
 * @param {any} props TODO: Define props
 */
function Previous({}) {
  return null;
}

/**
 * @param {any} props TODO: Define props
 */
function Next({}) {
  return null;
}

/**
 * @param {any} props TODO: Define props
 */
function Thumb({}) {
  return null;
}

function mapColumnNumbertoBreakpoints(obj, cols) {
  const breakpoints = {};
  if (obj.hasOwnProperty('ultralarge')) {
    breakpoints['140.625rem'] = obj.ultralarge;
  }
  if (obj.hasOwnProperty('xlarge')) {
    breakpoints['90rem'] = obj.xlarge;
  }
  if (obj.hasOwnProperty('large')) {
    breakpoints['75rem'] = obj.large;
  }
  if (obj.hasOwnProperty('medium')) {
    breakpoints['60rem'] = obj.medium;
  }
  if (obj.hasOwnProperty('small')) {
    breakpoints['53.125rem'] = obj.small;
  }
  if (obj.hasOwnProperty('mini')) {
    breakpoints['40rem'] = obj.mini;
  }
  if (obj.hasOwnProperty('tiny')) {
    breakpoints['25.9375rem'] = obj.tiny;
  }
  if (obj.hasOwnProperty('default')) {
    breakpoints.default = obj.default;
  } else {
    breakpoints.default = 3;
  }
  const options = {};
  for (const item in breakpoints) {
    options[item] = breakpoints[item] > cols ? cols : breakpoints[item];
  }
  return options;
}

// ====================================================================== Export
function Slider({ collection, arrowSelectors, rangeInput, rows, displayOptions, children }) {
  const [display, setDisplay] = useState(4);
  const [left, setLeft] = useState(0);
  const [columnWidth, setColumnWidth] = useState(0);
  const [thumbPosition, setThumbPosition] = useState(0);
  const debouncedDisplay = useDebounce(display, 500);

  const index = useRef(0);
  const range = useRef(0);
  const slidingRowWidth = useRef('100%');

  const animate = useRef(true);
  const rowContainer = useRef(/** @type {any} */ (null));
  const sliderInput = useRef(/** @type {any} */ (null));

  const content = children.find(child => child.type === Content);
  const previous = children.find(child => child.type === Previous);
  const next = children.find(child => child.type === Next);
  const thumb = children.find(child => child.type === Thumb);

  const columns = Math.ceil(collection.length / rows);
  const indices = columns - display + 1;
  const visibleColumns = mapColumnNumbertoBreakpoints(displayOptions, columns);

  const setSliderPosition = () => {
    setLeft(-1 * index.current * columnWidth);
  };

  const updateElementWidths = () => {
    const width = rowContainer.current.clientWidth / display;
    animate.current = false;
    slidingRowWidth.current = width * columns + 'px';
    setColumnWidth(width);
    setSliderPosition();
  };

  const incrementIndex = val => {
    animate.current = true;
    if (val === 'up') {
      index.current = Math.min(index.current + 1, columns - display);
    } else {
      index.current = Math.max(index.current - 1, 0);
    }
    setSliderPosition();
  };

  const matchBreakpointDisplayAmount = () => {
    let reset = true;
    for (const breakpoint in visibleColumns) {
      if (window.matchMedia(`(max-width: ${breakpoint})`).matches) {
        if (reset) {
          reset = false;
        }
        setDisplay(visibleColumns[breakpoint]);
      }
    }
    if (reset) {
      setDisplay(visibleColumns.default);
    }
  };

  const handleSliderResize = () => {
    index.current = 0;
    range.current = 0;
    sliderInput.current.value = 0;
    setThumbPosition(0);
    matchBreakpointDisplayAmount();
  };

  const handleSliderChange = () => {
    const pos = (sliderInput.current.value - indices / 2) / (indices * indices + 1 - indices / 2);
    range.current = pos;
    setThumbPosition(Math.max(pos * (sliderInput.current.clientWidth - 36), 0));
  };

  // ================================================================= Functions
  useEffect(() => {
    if (columns < display) {
      setDisplay(columns);
    }

    handleSliderResize();

    const resize = () => {
      handleSliderResize();
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (debouncedDisplay) {
      updateElementWidths();
    } 
  }, [debouncedDisplay]);

  useEffect(() => {
    animate.current = true;
    const i = Math.round(range.current * (indices - 1));
    const newIndex = Math.max(0, Math.min(i, indices));
    if (newIndex !== index.current) {
      index.current = newIndex;
      setSliderPosition();
    }
  }, [thumbPosition]);

  const containerStyles = {
    left: `${left}px`,
    width: slidingRowWidth.current,
  };

  const contentStyles = {
    width: `${columnWidth}px`,
  };

  const thumbStyles = {
    left: `${thumbPosition}px`,
  };

  // ========================================================= Template [Slider]
  return (
    <div className="zero_slider-container">
      <div className="zero_slider">
        <div className="zero_slider-row-container" ref={rowContainer}>
          <div className={clsx('zero_slider-row', animate ? 'zero_sliding' : '')} style={containerStyles}>
            {content.props.children &&
              content.props.children.map((item, i) => (
                <div key={`slider-item-${i}`} className="zero_click-wrapper" style={contentStyles}>
                  {item}
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="zero_slider-controls">
        {arrowSelectors && (
          <div className="zero_slide-selector">
            <div
              onClick={() => {
                incrementIndex('down');
              }}
            >
              {previous.props.children ? previous.props.children : ''}
            </div>
            <div
              onClick={() => {
                incrementIndex('up');
              }}
            >
              {next.props.children ? next.props.children : ''}
            </div>
          </div>
        )}

        {rangeInput && (
          <div className="zero_slider-range-input">
            <div className="zero_slider-dummy-thumb" style={thumbStyles}>
              {thumb.props.children ? thumb.props.children : ''}
            </div>
            <input
              ref={sliderInput}
              onChange={() => {
                handleSliderChange();
              }}
              type="range"
              step="0.1"
              min={indices / 2}
              max={indices * indices + 1}
            />
          </div>
        )}
      </div>
    </div>
  );
}

Slider.Content = Content;
Slider.Previous = Previous;
Slider.Next = Next;
Slider.Thumb = Thumb;

Slider.defaultProps = {
  arrowSelectors: true,
  rangeInput: false,
  rows: 1,
  displayOptions: { default: 3 },
};

// ====================================================================== Export
export default Slider;
