// ===================================================================== Imports
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';

import Img from '../cloudflareImage.js';
import Link from '../link/link';
import CardTier from './card-tier';
import Button from '../button/button';
import NpmIcon from '../../assets/icons/npmicon';
import Windows from '../../assets/icons/windows';
import analytics, { saEvent } from '../../lib/analytics';

// ====================================================================== Params
/**
 * @param {Object} props
 * @param {Object} props.card
 * @param {Object} props.cardsGroup
 * @param {number} props.index
 * @param {string|null} props.targetClass
 * @param {any} props.onCardLoad
 */
// ====================================================================== Export
export default function Card({ card, cardsGroup = [], index = 0, targetClass, onCardLoad }) {
  const router = useRouter();
  const hasIcon = card.hasOwnProperty('icon_before') && typeof card.icon_before === 'object';
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

  const onLinkClick = useCallback(e => {
    saEvent(analytics.events.LINK_CLICK_EXPLORE_DOCS, { link_text: e.currentTarget });
  }, []);

  const handleButtonClick = useCallback(
    cta => {
      if (cta.url) {
        router.push(cta.url);
      }
    },
    [router]
  );

  const navigateOnCardClick = useCallback(
    item => {
      if (!item.cta && item.action === 'next-link') {
        router.push(item.url);
      }
    },
    [router]
  );

  const renderExploreCards = obj => {
    return (
      <>
        {obj.categories.map(category => (
          <div key={category.heading} className="category">
            <div className="category-heading">{category.heading}</div>
            {category.links.map(link => (
              <Link className="category-link" onClick={onLinkClick} href={link.url} key={link.text}>
                {link.text}
              </Link>
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
        return (
          <div className="code-wrapper">
            <code className="code-feature" dangerouslySetInnerHTML={{ __html: obj.feature }}></code>
          </div>
        );
      case 'C':
        return (
          <>
            <div className="image-wrapper">
              <Img src={obj.image} width="64" height="64" />
            </div>
            {card.title && <div className="title">{card.title}</div>}
            {card.subtitle && <div className="subtitle">{card.subtitle}</div>}
          </>
        );
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
        <a href={obj.url} target="_blank" rel="noreferrer noopener">
          {svg}
        </a>
      );
    }
    return (
      <a href={obj.url} target="_blank" rel="noreferrer noopener">
        {obj.text ? obj.text : ''}
      </a>
    );
  };

  // ========================================================= Templates [Cards]
  if (card.type === 'E') {
    return <CardTier card={card} cardsGroup={cardsGroup} index={index} onCardLoad={onCardLoad} />;
  }

  const CustomTag = card.action === 'link' ? 'a' : 'div';
  return (
    <CustomTag
      href={card.action === 'link' ? card.url : undefined}
      target="_blank"
      rel="noreferrer noopener"
      className={clsx('card', `type__${card.type}`, card.action ? `has-${card.action}` : '')}
      onClick={card.action === 'next-link' ? () => navigateOnCardClick(card) : undefined}
    >
      {card.label && <div className="label">{card.label}</div>}

      {<div className={clsx('feature-wrapper', targetClass)}>{getFeaturedElement(card)}</div>}

      {card.title && card.type !== 'C' && <div className="title">{card.title}</div>}

      {card.subtitle && card.type !== 'C' && <div className="subtitle">{card.subtitle}</div>}

      {card.description && (
        <div className={clsx('description', targetClass)}>
          <span dangerouslySetInnerHTML={{ __html: card.description }}></span>
        </div>
      )}

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
    </CustomTag>
  );
}
