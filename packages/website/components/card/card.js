// ===================================================================== Imports
import clsx from 'clsx';
import Image from 'next/image';

import Button from '../button/button';
// ====================================================================== Params
/**
 * @param {Object} props.card
 * @param {Object} props.parent
 * @param Number props.index
 */
// ====================================================================== Export
export default function Card({ card, parent, index }) {
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

  // ========================================================= Templates [Cards]
  if (card.type === 'E') {
    const len = parent.cards.length;
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

              {parent.cards.map((card, j) => (
                <div key={card.title} className="storage-bar-tier" style={{ flexGrow: j + 1 }}>
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
                <Button href={card.cta.link} variant={card.cta.theme} tracking={{}}>
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

      {card.cta && (
        <Button href={card.cta.link} variant={card.cta.theme} tracking={{}}>
          {card.cta.text}
        </Button>
      )}
    </div>
  );
}
