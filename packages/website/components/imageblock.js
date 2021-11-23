import clsx from 'clsx';

/**
 * @param {Object} props.block
*/

export default function ImageBlock({block}) {
  return (
    <>
      { block.src && (
        <div class="block image-block">
          <img src={block.src} class="image" />
          <div
            class="label">
            { block.label }
          </div>
        </div>
      )}
    </>
  )
}
