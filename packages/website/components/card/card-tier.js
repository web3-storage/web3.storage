// ===================================================================== Imports
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';

import Button from '../button/button';
import analytics from '../../lib/analytics';
import { elementIsInViewport } from '../../lib/utils.js';

// ====================================================================== Params
/**
 * @param {Object} props
 * @param {Object} props.card
 * @param {Object} props.cardsGroup
 * @param {number} props.index
 * @param {any} props.onCardLoad
 */
// ====================================================================== Export
export default function Card({ card, cardsGroup = [], index = 0, onCardLoad }) {
  const [cardIsInViewport, setCardIsInViewport] = useState(false);
  const cardRef = useRef(/** @type {any} */ (null));
  const router = useRouter();
  const tracking = {};
  if (typeof card.cta === 'object') {
    if (card.cta.event) {
      tracking.event = analytics.events[card.cta.event];
    }
    if (card.cta.ui) {
      tracking.ui = analytics.ui[card.cta.ui];
    }
    if (card.cta.action) {
      tracking.action = card.cta.action;
    }
  }
  // ================================================================= Functions
  useEffect(() => {
    if (onCardLoad) {
      onCardLoad('loaded');
    }
  }, [onCardLoad]);

  const handleButtonClick = useCallback(
    cta => {
      if (cta.url) {
        router.push(cta.url);
      }
    },
    [router]
  );

  const progressBarWidth = useMemo(() => {
    const len = cardsGroup.length;
    let sum = 0;
    let weight = 0;

    for (let i = 0; i < index + 1; i++) {
      weight = weight + (i + 1);
    }
    for (let i = 0; i < len; i++) {
      sum = sum + (i + 1);
    }
    const progressDisplay = 75;
    return Math.round((weight / sum) * progressDisplay);
  }, [cardsGroup, index]);

  useEffect(() => {
    setCardIsInViewport(elementIsInViewport(cardRef.current));
    const scroll = () => {
      if (!cardIsInViewport) {
        const result = elementIsInViewport(cardRef.current);
        if (cardIsInViewport !== result) {
          setCardIsInViewport(result);
        }
      }
    };
    window.addEventListener('scroll', scroll);
    return () => {
      window.removeEventListener('scroll', scroll);
    };
  }, [cardIsInViewport]);

  const cardStyles = {
    width: !cardIsInViewport ? '2.5rem' : `${progressBarWidth}%`,
    transition: `${progressBarWidth * 25}ms ease-out`,
    backgroundPosition: !cardIsInViewport ? '0 0' : `-75% 0`,
  };

  // ========================================================= Templates [Cards]
  return (
    <div ref={cardRef} className={clsx('card', `type__${card.type}`)}>
      <div className="grid-middle-noGutter">
        <div className="col-12">
          <div className={'feature_storage-bar'}>
            <div className={'feature_storage-bar-highlight'} style={cardStyles}></div>

            {cardsGroup.map((card, j) => (
              <div key={card.title} className="storage-bar-tier">
                <span className={clsx('storage-bar-tier-label', index < j ? 'display' : '')}>{card.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-4_md-5_sm-6_mi-12">
          <div className={'card_panel-left'}>
            {card.label && <div className="label">{card.label}</div>}

            {card.title && <div className="title">{card.title}</div>}

            {card.description && (
              <div className="description" dangerouslySetInnerHTML={{ __html: card.description }}></div>
            )}

            {card.cta && (
              <Button
                className={'cta'}
                variant={card.cta.theme}
                tracking={tracking}
                onClick={() => handleButtonClick(card.cta)}
                onKeyPress={() => handleButtonClick(card.cta)}
              >
                {card.cta.text}
              </Button>
            )}
          </div>
        </div>

        <div className="col-7_sm-6_mi-0">
          <div className={'card_panel-right'}>
            {card.description && (
              <div className="description" dangerouslySetInnerHTML={{ __html: card.description }}></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
