// ===================================================================== Imports
import Card from '../card/card';

// ====================================================================== Params
/**
 * @param {Object} props.block
 */
// ====================================================================== Export
export default function CardListBlock({ block }) {
  const direction = block.direction || 'row';
  return (
    <div className="block card-list-block">
      <div className={`card-${direction}`}>
        {block.cards.map((card, index) => (
          <Card key={`card-${index}`} card={card} cardsGroup={block.cards} index={index} />
        ))}
      </div>
    </div>
  );
}
