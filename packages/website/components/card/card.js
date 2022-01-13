// ===================================================================== Imports
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import Image from 'next/image';

import Button from '../button/button';
import NpmIcon from '../../assets/icons/npmicon';
import Windows from '../../assets/icons/windows';
import countly from '../../lib/countly';
// ====================================================================== Params
/**
 * @param {Object} props
 * @param {Object} props.card
 * @param {Object} props.cardsGroup
 * @param {number} props.index
 */
// ====================================================================== Export
export default function Card({ card, cardsGroup = [], index = 0 }) {
  const router = useRouter();
  const hasIcon = card.hasOwnProperty('icon_before') && typeof card.icon_before === 'object';
  const tracking = {};
  if (typeof card.cta === 'object') {
    if (card.cta.event) {
      tracking.event = countly.events[card.cta.event];
    }
    if (card.cta.ui) {
      tracking.ui = countly.ui[card.cta.ui];
    }
    if (card.cta.action) {
      tracking.action = card.cta.action;
    }
  }
  // ================================================================= Functions
  const renderExploreCards = obj => {
    return (
      <>
        {obj.categories.map(category => (
          <div key={category.heading} className="category">
            <div className="category-heading">{category.heading}</div>
            {category.links.map(link => (
              <div key={link.text} className="category-link">
                <a href={link.url}>{link.text}</a>
              </div>
            ))}
          </div>
        ))}
      </>
    );
  };

  const getFeaturedElement = obj => {
    switch (obj.type) {
      case 'A':
        return <div className="feature">{obj.feature}</div>;
      case 'B':
        return <code className="code-feature" dangerouslySetInnerHTML={{ __html: obj.feature }}></code>;
      case 'C':
        return <Image src={obj.image} width="64" height="64" />;
      case 'D':
        return renderExploreCards(obj);
      default:
        return false;
    }
  };

  const getIcon = obj => {
    let svg;
    if (obj.hasOwnProperty('svg')) {
      switch (obj.svg) {
        case 'npm_icon':
          svg = <NpmIcon />;
          break;
        case 'windows_icon':
          svg = <Windows />;
          break;
        default:
          svg = false;
          break;
      }
    }
    if (svg) {
      return (
        <a href={obj.url} target="_blank" rel="noreferrer">
          {svg}
        </a>
      );
    }
    return (
      <a href={obj.url} target="_blank" rel="noreferrer">
        {obj.text ? obj.text : ''}
      </a>
    );
  };

  const handleButtonClick = useCallback(
    cta => {
      if (cta.url) {
        router.push(cta.url);
      }
    },
    [router]
  );

  // ========================================================= Templates [Cards]
  if (card.type === 'E') {
    const len = cardsGroup.length;
    let sum = 0;
    let weight = 0;

    for (let i = 0; i < index + 1; i++) {
      weight = weight + (i + 1);
    }
    for (let i = 0; i < len; i++) {
      sum = sum + (i + 1);
    }
    const width = Math.round((weight / sum) * 100) + '%';

    return (
      <div className={clsx('card', `type__${card.type}`)}>
        <div className="grid-middle-noGutter">
          <div className="col-12">
            <div className={'feature_storage-bar'}>
              <div className={'feature_storage-bar-highlight'} style={{ width: width }}></div>

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

  return (
    <div className={clsx('card', `type__${card.type}`)}>
      {card.label && <div className="label">{card.label}</div>}

      {<div className="feature-wrapper">{getFeaturedElement(card)}</div>}

      {card.title && <div className="title">{card.title}</div>}

      {card.subtitle && <div className="subtitle">{card.subtitle}</div>}

      {card.description && <div className="description">{card.description}</div>}

      {hasIcon && <div className="icon-before">{getIcon(card.icon_before)}</div>}

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
  );
}
