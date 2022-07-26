import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';

import { ReactComponent as Chevron } from '../../../assets/icons/chevron.svg';

let ScrollMagic;
if (typeof window !== 'undefined') {
  ScrollMagic = require('scrollmagic');
}

export default function Toc() {
  const [isOpen, setOpen] = useState(false);
  const [nestedHeadings, setNestedHeadings] = useState([]);
  const [updateKey, setUpdateKey] = useState(0);
  const activeHeadings = useRef({});
  const lastActive = useRef('');
  let controller;

  const toggleClass = () => {
    setOpen(!isOpen);
  };

  const string_to_slug = str => {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
    // remove accents, swap ñ for n, etc
    var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;';
    var to = 'aaaaeeeeiiiioooouuuunc------';
    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    str = str
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
    return str;
  };

  const updateHeadings = id => {
    let lastId = '';
    for (const element in activeHeadings.current) {
      if (activeHeadings.current[element]) {
        activeHeadings.current[element] = false;
        lastId = element;
        break;
      }
    }
    if (lastId !== id) {
      activeHeadings.current[id] = true;
      lastActive.current = lastId;
      setUpdateKey(key => key + 1);
    }
  };

  const getNestedHeadings = headingElements => {
    const nestedHeadings = [];
    const headingIds = [];
    const idCounts = {};

    headingElements.forEach((heading, index) => {
      const innerTextSlug = string_to_slug(heading.innerText);
      idCounts[innerTextSlug] = idCounts[innerTextSlug] ? idCounts[innerTextSlug] + 1 : 1;
      const id = `${innerTextSlug}${idCounts[innerTextSlug] > 1 ? `-${idCounts[innerTextSlug]}` : ''}`;
      const title = heading.innerText;
      activeHeadings.current[id] = false;
      headingIds.push(id);
      // add a[href] to headings
      heading.innerHTML = '<a href="#' + id + '" id="' + id + '">' + title + '</a>';
      // store toc data
      if (heading.nodeName === 'H2') {
        nestedHeadings.push({ id, title, items: [] });
      } else if (heading.nodeName === 'H3' && nestedHeadings.length > 0) {
        nestedHeadings[nestedHeadings.length - 1].items.push({ id, title });
      }

      // scroll effects / add active class
      const exitScene = e => {
        if (e.scrollDirection === 'REVERSE' && index !== 0) {
          updateHeadings(headingIds[index - 1]);
        }
      };

      const scene = new ScrollMagic.Scene({
        triggerElement: `#${id}`,
        triggerHook: 0.25,
        duration: 200,
      })
        .on('enter', () => {
          updateHeadings(id);
        })
        .addTo(controller);
      scene.on('leave', exitScene).addTo(controller);
    });
    return nestedHeadings;
  };

  const Headings = ({ headings }) => (
    <ul>
      {headings.map((heading, i) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            className={clsx(
              activeHeadings.current[heading.id] ? 'active' : '',
              heading.id === lastActive.current ? 'heading-slide-out' : ''
            )}
          >
            {heading.title}
          </a>
          {heading.items.length > 0 && (
            <ul>
              {heading.items.map((child, j) => (
                <li key={child.id}>
                  <a
                    href={`#${child.id}`}
                    className={clsx(
                      activeHeadings.current[child.id] ? 'active' : '',
                      child.id === lastActive.current ? 'heading-slide-out' : ''
                    )}
                  >
                    {child.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );

  useEffect(() => {
    controller = new ScrollMagic.Controller();
    const headingElements = Array.from(document.querySelectorAll('.docs-body h2, .docs-body h3'));
    const newNestedHeadings = getNestedHeadings(headingElements);
    // @ts-ignore
    setNestedHeadings(newNestedHeadings);

    // setTimeout needed to wait for the dom to be rendered
    setTimeout(() => {
      if (window.location.hash) {
        const el = document.getElementById(window.location.hash.substring(1));
        if (el) {
          controller.scrollTo(window.location.hash);
        }
      }
    });
  }, []);

  return (
    <>
      {nestedHeadings.length !== 0 && (
        <div className="toc-container">
          <div
            tabIndex={0}
            onKeyPress={toggleClass}
            role="button"
            onClick={toggleClass}
            className={isOpen ? 'toc-mobile-dropdown mobile-open' : 'toc-mobile-dropdown'}
          >
            On this page
            <Chevron />
          </div>
          <div id="toc" className={isOpen ? 'mobile-open' : ''}>
            <Headings headings={nestedHeadings} />
          </div>
        </div>
      )}
    </>
  );
}
