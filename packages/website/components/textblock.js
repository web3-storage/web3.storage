import clsx from 'clsx'
import Button from './button'
import countly from '../lib/countly'

/**
 * @param {Object} props.block
 * @param {Object} props.classList
*/

export default function TextBlock({block, classList}) {

  const format = block.format || 'medium'
  const theme = block.theme || 'light'
  const tracking = {
    ui: countly.ui[block.cta.tracking.ui],
    action: block.cta.tracking.action
  }

  const getHeadingType = (block) => {
    switch (block.format) {
      case 'header' : return <h1 class={ clsx("heading", classList.heading)}>{ block.heading }</h1>;
      case 'small' : return <h3 class={ clsx("heading", classList.heading)}>{ block.heading }</h3>;
      default : return <h2 class={ clsx("heading", classList.heading)}>{ block.heading }</h2>;
    }
  }

  return (
    <div className={clsx('block text-block', `format__${format}`, `theme__${theme}`)}>

      { typeof block.label === 'string' &&
        <div class={ clsx("label", classList.label)}>
          <span class={ clsx("label-textual", classList.labelTextual)}>
            { block.label }
          </span>
        </div>
      }

      { typeof block.heading === 'string' && getHeadingType(block) }

      { typeof block.subheading === 'string' &&
        <div class={ clsx("subheading", classList.subheading)}>
          { block.subheading }
        </div>
      }

      { typeof block.description === 'string' &&
        <div class={ clsx("description", classList.description)}>
          { block.description }
        </div>
      }

      { typeof block.cta === 'object' &&
        <div class="button">
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
