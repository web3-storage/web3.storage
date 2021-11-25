// ===================================================================== Imports
import clsx from 'clsx';
import styles from './imageblock.module.scss'
import Image from 'next/image'

// ====================================================================== Params
/**
 * @param {Object} props.block
*/
// ====================================================================== Export
export default function ImageBlock({block}) {
  return (
    <>
      { block.src && (
        <div className={ clsx("block", "image-block", styles.imageBlock) }>

          <Image src={block.src} layout="fill" />

          <div
            className={ clsx(styles.label) }>
            { block.label }
          </div>

        </div>
      )}
    </>
  )
}
