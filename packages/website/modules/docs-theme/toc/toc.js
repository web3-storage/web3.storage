import { useEffect, useState } from 'react';
let ScrollMagic;
if (typeof window !== 'undefined') {
  ScrollMagic = require('scrollmagic');
}

export default function Toc() {
  const [isOpen, setOpen] = useState(false);
  const [nestedHeadings, setNestedHeadings] = useState([]);
  let controller;
  // const controller = new ScrollMagic.Controller();

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

  const getNestedHeadings = headingElements => {
    const nestedHeadings = [];
    headingElements.forEach((heading, index) => {
      const id = string_to_slug(heading.innerText);
      const title = heading.innerText;
      // add a[href] to headings
      heading.innerHTML = '<a href="#' + id + '" id="' + id + '">' + title + '</a>';
      // store toc data
      if (heading.nodeName === 'H2') {
        nestedHeadings.push({ id, title, items: [] });
      } else if (heading.nodeName === 'H3' && nestedHeadings.length > 0) {
        nestedHeadings[nestedHeadings.length - 1].items.push({
          id,
          title,
        });
      }
      // scroll effects / add active class
      new ScrollMagic.Scene({ triggerElement: `#${id}` })
        .on('enter leave', () => {
          document.querySelectorAll('#toc a').forEach(el => {
            el.classList.remove('active');
          });
          document.querySelector(`#toc a[href="#${id}"]`)?.classList.add('active');
        })
        .addTo(controller);
    });
    return nestedHeadings;
  };

  const Headings = ({ headings }) => (
    <ul>
      {headings.map(heading => (
        <li key={heading.id}>
          <a href={`#${heading.id}`}>{heading.title}</a>
          {heading.items.length > 0 && (
            <ul>
              {heading.items.map(child => (
                <li key={child.id}>
                  <a href={`#${child.id}`}>{child.title}</a>
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
            className="toc-mobile-dropdown"
          >
            On this page
          </div>
          <div id="toc" className={isOpen ? 'mobile-open' : ''}>
            <Headings headings={nestedHeadings} />
          </div>
        </div>
      )}
    </>
  );
}
