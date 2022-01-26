// ===================================================================== Imports
import { useRef, useEffect, useCallback } from 'react';

import { standardizeSiblingHeights } from '../../lib/utils.js';
import Card from '../card/card';
// ====================================================================== Params
/**
 * @param {Object} props.block
 */
// ====================================================================== Export
export default function CardListBlock({ block }) {
  const childrenLoaded = useRef([]);
  const direction = block.direction || 'row';
  const blockB = block.cards.every(card => card.type === 'B');
  const targetClass = blockB ? 'height-standard-target' : '';

  const setCardContentHeights = useCallback(() => {
    standardizeSiblingHeights(`description ${targetClass}`, true);
    standardizeSiblingHeights(`feature-wrapper ${targetClass}`, true);
  }, [targetClass]);

  const childCardLoaded = msg => {
    childrenLoaded.current.push(msg);

    if (blockB && childrenLoaded.current.length === block.cards.length) {
      setTimeout(() => {
        setCardContentHeights();
      }, 1000);
    }
  };

  useEffect(() => {
    if (blockB && childrenLoaded.current.length === block.cards.length) {
      const resize = () => {
        setCardContentHeights();
      };
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }
  }, [blockB, block.cards.length, setCardContentHeights]);

  // ================================================================== Template
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
            onload={childCardLoaded}
          />
        ))}
      </div>
    </div>
  );
}
