import Card from './card';

/**
 * @param {Object} props.block
*/

export default function CardListBlock({block}) {
  return (
    <div class="block card-list-block">
      <div class="card-column">
        {block.cards.map((card, index) => (
          <Card
            key={`card-${index}`}
            card={card} />
        ))}
      </div>
    </div>
  )
}
