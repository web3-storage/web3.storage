import clsx from 'clsx';

/**
 * @param {Object} props.card
*/

export default function Card({card}) {
  return (
    <div className={ clsx('block', 'text-block')}>
      <div class="title">{ card.title }</div>
      <div class="description">{ card.description }</div>
    </div>
  )
}
