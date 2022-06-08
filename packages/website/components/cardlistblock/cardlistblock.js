import { useRef, useEffect, useCallback } from 'react';

import { standardizeSiblingHeights } from '../../lib/utils.js';
import Card from '../card/card';

/**
 * @param {Object} props.block
 */

export default function CardListBlock({ block }) {
  const childrenLoaded = useRef(/** @type {string[]} */ ([]));
  const direction = block.direction || 'row';
  const blockB = block.cards.every(card => card.type === 'B');
  const blockF = block.cards.every(card => card.type === 'F');
  const standardHeights = blockB || blockF;
  const targetClass = standardHeights ? 'height-standard-target' : '';

  const setCardContentHeights = useCallback(() => {
    const classname = blockB ? 'feature-wrapper' : 'title';
    standardizeSiblingHeights(`description ${targetClass}`, true);
    standardizeSiblingHeights(`${classname} ${targetClass}`, true);
  }, [targetClass, blockB]);

  const childCardLoaded = msg => {
    childrenLoaded.current.push(msg);

    if (standardHeights && childrenLoaded.current.length === block.cards.length) {
      setTimeout(() => {
        setCardContentHeights();
      }, 1000);
    }
  };

  useEffect(() => {
    if (standardHeights && childrenLoaded.current.length === block.cards.length) {
      const resize = () => {
        setCardContentHeights();
      };
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }
  }, [standardHeights, block.cards.length, setCardContentHeights]);

  return (
    <div className="block card-list-block">
      <div className={`card-${direction}`}>
        {block.cards.map((card, index) => (
          <Card
            key={`card-${index}`}
            card={card}
            cardsGroup={block.cards}
            index={index}
            targetClass={targetClass}
            onCardLoad={childCardLoaded}
          />
        ))}
      </div>
    </div>
  );
}
