// ===================================================================== Imports
import clsx from 'clsx';
import Image from 'next/image';

import Button from '../button/button';

// ====================================================================== Params
/**
 * @param {Object} props.card
 */
// ====================================================================== Export
export default function Card({ card }) {
  // ================================================================= Functions
  const renderExploreCards = obj => {
    return (
      <>
        {obj.categories.map(category => (
          <div className="category">
            <div class="category-heading">{category.heading}</div>
            {category.links.map(link => (
              <div class="category-link">
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
        return <div class="feature">{obj.feature}</div>;
      case 'B':
        return <code class="code-feature" dangerouslySetInnerHTML={{ __html: obj.feature }}></code>;
      case 'C':
        return <Image src={obj.image} width="64" height="64" />;
      case 'D':
        return renderExploreCards(obj);
      default:
        return false;
    }
  };

  // =========================================================== Template [Card]
  return (
    <div className={clsx('card', `type__${card.type}`)}>
      {card.label && <div class="label">{card.label}</div>}

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
