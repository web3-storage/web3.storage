import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { ReactComponent as Chevron } from '../../assets/icons/chevron.svg';

export default function Scroll2Top() {
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    const scroll = () => {
      if (window.scrollY > 50) {
        if (!display) {
          setDisplay(true);
        }
      } else {
        if (display) {
          setDisplay(false);
        }
      }
    };

    window.addEventListener('scroll', scroll);

    return () => {
      window.removeEventListener('scroll', scroll);
    };
  }, [display]);

  const scroll2TopClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className={clsx('scroll-2-top-footer', display ? 'show' : '')}>
      <button className="scroll-2-top-button" onClick={scroll2TopClick} onKeyPress={scroll2TopClick}>
        <div className="scroll-2-top-text">Top</div>
        <Chevron />
      </button>
    </div>
  );
}
