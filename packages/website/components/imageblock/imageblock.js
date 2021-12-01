// ===================================================================== Imports
import clsx from 'clsx';
import styles from './imageblock.module.scss'
// ====================================================================== Params
/**
 * @param {Object} props.block
*/
// ====================================================================== Export
export default function ImageBlock({block}) {
  return (
    <>
      { block.src && (
        <div className={ clsx("block", styles.imageBlock)}>

          <img src={block.src} className={ clsx(styles.image) } />

          <div
            className={ clsx(styles.label) }>
            { block.label }
          </div>

        </div>
      )}
    </>
  )
}
