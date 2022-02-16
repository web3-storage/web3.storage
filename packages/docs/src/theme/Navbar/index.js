import OriginalNavbar from '@theme-original/Navbar';
import React, { useEffect } from 'react';

function Navbar(props) {
  // toggle visibility on scroll
  useEffect(() => {
    var doc = document.documentElement;
    var w = window;
    var prevScroll = w.scrollY || doc.scrollTop;
    var curScroll;
    var direction = 0;
    var prevDirection = 0;
    var offset = 100;
    var header = document.querySelector('.navbar');
    var checkScroll = function() {
        /*
        ** Find the direction of scroll
        ** 0 - initial, 1 - up, 2 - down
        */
        curScroll = w.scrollY || doc.scrollTop;
        if (curScroll > prevScroll) { 
            // scrolled up
            direction = 2;
        } else if (curScroll < prevScroll) { 
            // scrolled down
            direction = 1;
        }
        if (direction !== prevDirection) {
            toggleHeader(direction, curScroll);
        }
        if (curScroll < offset) {
          header.classList.remove('show-gradient');
        } else {
          header.classList.add('show-gradient');
        }
        prevScroll = curScroll;
    };
    var toggleHeader = function(direction, curScroll) {
        if (direction === 2 && curScroll > offset) { 
            header.classList.add('hide');
            prevDirection = direction;
        } else if (direction === 1) {
            header.classList.remove('hide');
            if (curScroll > offset) {
              header.classList.add('show-gradient');
            }
            prevDirection = direction;
        }
    };
    window.addEventListener('scroll', checkScroll);
  }, []);

  return (
    <OriginalNavbar {...props} />
  );
}

export default Navbar;