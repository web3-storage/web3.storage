// ===================================================================== Imports
import Card from '../card/card';
// @ts-ignore
import ZeroSlider from 'ZeroComponents/slider/slider';

// ====================================================================== Params
/**
 * @param {Object} props.block
 */
// ====================================================================== Export
export default function SliderBlock({ block }) {
  return (
    <div className="block slider-block">
      <ZeroSlider collection={block.slides} arrowSelectors={false} rangeInput={true} displayOptions={block.breakpoints}>
        <ZeroSlider.Content>
          {block.slides.map((card, index) => (
            <Card
              key={`slider-item-${index}`}
              card={card}
              cardsGroup={null}
              index={index} />
          ))}
        </ZeroSlider.Content>

        <ZeroSlider.Previous>
          <div>left</div>
        </ZeroSlider.Previous>

        <ZeroSlider.Next>
          <div>right</div>
        </ZeroSlider.Next>

        <ZeroSlider.Thumb>
          <div className="testimonials-slider-thumb"></div>
        </ZeroSlider.Thumb>
      </ZeroSlider>
    </div>
  );
}
