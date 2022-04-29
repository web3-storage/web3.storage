import { useEffect, useRef, useState } from 'react';
let ScrollMagic;
if (typeof window !== 'undefined') {
  ScrollMagic = require('scrollmagic');
}

export default function Toc() {
  let headings = useRef(['']);
  const [isOpen, setOpen] = useState(false);

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

  useEffect(() => {
    let start = 0;
    let html = '';
    let c = document.querySelector('.docs-body')?.children;

    if (!c) {
      return;
    }

    for (let i = 0; i < c.length; i++) {
      if (c[i].nodeName.match(/^H2|H3|H4$/)) {
        const level = parseInt(c[i].nodeName.substr(1));
        const headerText = c[i].innerHTML;
        const anchor = string_to_slug(headerText);
        headings.current.push(anchor);
        // edit main doc
        c[i].innerHTML = '<a href="#' + anchor + '" id="' + anchor + '">' + headerText + '</a>';
        if (headerText) {
          if (level > start) {
            html += new Array(level - start + 1).join('<ul>');
          } else if (level < start) {
            html += new Array(start - level + 1).join('</li></ul>');
          } else {
            html += new Array(start + 1).join('</li>');
          }
          start = level;
          html += '<li><a href="#' + anchor + '">' + headerText + '</a>';
        }
      }
    }
    if (start) {
      html += new Array(start + 1).join('</ul>');
    }
    // @ts-ignore
    // sorry ugly, fix later
    document.querySelector('#toc').innerHTML = html;

    const controller = new ScrollMagic.Controller({ globalSceneOptions: { duration: 10 } });
    headings.current.map(item => {
      return new ScrollMagic.Scene({ triggerElement: `#${item}` })
        .on('enter leave', () => {
          document.querySelectorAll('#toc a').forEach(el => {
            el.classList.remove('active');
          });
          document.querySelector(`#toc a[href="#${item}"]`)?.classList.add('active');
        })
        .addTo(controller);
    });
  }, []);

  return (
    <div className="toc-container">
      <div tabIndex={0} onKeyPress={toggleClass} role="button" onClick={toggleClass} className="toc-mobile-dropdown">
        On this page
      </div>
      <div id="toc" className={isOpen ? 'mobile-open' : ''}></div>
    </div>
  );
}
