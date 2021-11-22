import clsx from 'clsx';

/**
 * @param {Object} props.block
*/

export default function TextBlock({block}) {
  return (
    <div className={ clsx('block', 'text-block')}>
      <div class="heading">{ block.heading }</div>
      <div class="subheading">{ block.subheading }</div>
    </div>
  )
}
