import { useRouter } from 'next/router';
import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import ZeroAccordionHeader from 'ZeroComponents/accordion/accordionHeader';
import { saEvent } from 'lib/analytics';

/**
 * @param {any} props TODO: Define props
 * @callback props.toggle
 * @param Boolean props.toggleOnLoad
 */
function Header({ }) {
  return null;
}

/**
 * @param {any} props TODO: Define props
 */
function Content({ }) {
  return null;
}

const generateUID = () => {
  const firstNum = (Math.random() * 46656) | 0;
  const secondNum = (Math.random() * 46656) | 0;
  const first = ('000' + firstNum.toString(36)).slice(-3);
  const second = ('000' + secondNum.toString(36)).slice(-3);
  return first + second;
};

/**
 * User Info Hook
 *
 * @param { any } props TODO: Define props
 */
function AccordionSection({ active, toggle, toggleOnLoad, reportUID, slug, disabled, children, trackingId }) {
  const [uid, setUID] = useState(generateUID);
  const [openOnNavigate, setopenOnNavigate] = useState(false);
  const router = useRouter();
  const header = children.find(child => child.type === Header);
  const content = children.find(child => child.type === Content);
  const open = active.includes(uid);

  useEffect(() => {
    reportUID(uid);
  }, [reportUID, uid]);

  useEffect(() => {
    if (open && trackingId) {
      saEvent('accordion_opened', { title: trackingId });
    }
  }, [open, trackingId]);

  useEffect(() => {
    if (!!slug && !!router.query.section && router.query.section === slug) {
      const element = document.getElementById(`accordion-section_${slug}`);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 16;
        window.scrollTo(0, y);
      }
      setopenOnNavigate(true);
    }
  }, [router, slug]);

  return (
    <div id={`accordion-section_${slug}`} className={clsx('accordion-section', open ? 'open' : '')}>
      <ZeroAccordionHeader
        uid={uid}
        toggle={
          disabled
            ? () => {
              return null;
            }
            : toggle
        }
      >
        {header ? header.props.children : null}
      </ZeroAccordionHeader>
      <div className="accordion-content">{content ? content.props.children : null}</div>
    </div>
  );
}

AccordionSection.Header = Header;

AccordionSection.Content = Content;

AccordionSection.defaultProps = {
  disabled: false,
};

export default AccordionSection;
