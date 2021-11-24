import clsx from 'clsx'
import Button from './button'
import countly from '../lib/countly'

/**
 * @param {Object} props.block
*/

export default function TextBlock({block}) {

  const format = block.format || 'medium'
  const theme = block.theme || 'light'
  const tracking = {
    ui: countly.ui[block.cta.tracking.ui],
    action: block.cta.tracking.action
  }

  const getHeadingType = (block) => {
    switch (block.format) {
      case 'header' : return <h1 class="heading h1">{ block.heading }</h1>;
      case 'small' : return <h3 class="heading h3">{ block.heading }</h3>;
      default : return <h2 class="heading h2">{ block.heading }</h2>;
    }
  }

  return (
    <div class={clsx('block text-block', `format__${format}`, `theme__${theme}`)}>

      { typeof block.label === 'string' &&
        <div class="label">
          <span class="label-textual">
            { block.label }
          </span>
        </div>
      }

      { typeof block.heading === 'string' && getHeadingType(block) }

      { typeof block.subheading === 'string' &&
        <div class="subheading">
          { block.subheading }
        </div>
      }

      { typeof block.description === 'string' &&
        <div class="description">
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
