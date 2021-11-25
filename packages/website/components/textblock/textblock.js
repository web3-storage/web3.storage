// ===================================================================== Imports
import clsx from 'clsx'
import Button from '../button/button'
import countly from '../../lib/countly'
import styles from './textblock.module.scss'

// ====================================================================== Params
/**
 * @param {Object} props.block
 * @param {Object} props.className
*/
// ====================================================================== Export
export default function TextBlock({block, className}) {
  Object.assign(styles, className);
  const format = block.format || 'medium'
  const theme = block.theme || 'light'
  const tracking = {
    ui: countly.ui[block.cta.tracking.ui],
    action: block.cta.tracking.action
  }
  // ================================================================= Functions
  const getHeadingType = (block) => {
    switch (block.format) {
      case 'header' : return <h1 className={ clsx(styles.heading, "h1")}>{ block.heading }</h1>;
      case 'small' : return <h3 className={ clsx(styles.heading, "h3")}>{ block.heading }</h3>;
      default : return <h2 className={ clsx(styles.heading, "h2")}>{ block.heading }</h2>;
    }
  }
  // ==================================================================== Export
  return (
    <div className={clsx('block text-block', `format__${format}`)}>

      { typeof block.label === 'string' &&
        <div classNames={ clsx(styles.label) }>
          <span className={ clsx(styles.labelText) }>
            { block.label }
          </span>
        </div>
      }

      { typeof block.heading === 'string' && getHeadingType(block) }

      { typeof block.subheading === 'string' &&
        <div className={ clsx(styles.subheading)}>
          { block.subheading }
        </div>
      }

      { typeof block.description === 'string' &&
        <div className={ clsx(styles.description)}>
          { block.description }
        </div>
      }

      { typeof block.cta === 'object' &&
        <div className={styles.cta}>
          <Button
            href={block.cta.url}
            tracking={tracking}>

              {block.cta.text}

          </Button>
        </div>
      }

    </div>
  )
}
