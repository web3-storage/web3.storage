import clsx from 'clsx';

/**
 * @param {Object} props.card
 */

export default function Card({ card }) {
  const type = card.type || 'A';
  return (
    <div className={clsx('card', `type__${type}`)}>
      {card.label && <div class="label">{card.label}</div>}

      {card.feature && (
        <div class="feature-wrapper">
          <div class="feature">{card.feature}</div>
        </div>
      )}

      {card.title && <div class="title">{card.title}</div>}

      {card.subtitle && <div class="subtitle">{card.subtitle}</div>}

      {card.description && <div class="description">{card.description}</div>}
    </div>
  );
}
