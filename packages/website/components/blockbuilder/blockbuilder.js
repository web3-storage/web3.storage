// ===================================================================== Imports
import React from 'react';
import clsx from 'clsx';

import Hero from '../hero';
import TextBlock from '../textblock/textblock.js';
import ImageBlock from '../imageblock/imageblock.js';
import CardListBlock from '../cardlistblock/cardlistblock';
import SliderBlock from '../sliderblock/sliderblock';
import AccordionBlock from '../accordionblock/accordionblock';
import CodePreview from '../codepreview/codepreview';
import SiteLogo from '../../assets/icons/w3storage-logo.js';
import GradientBackground from '../gradientbackground/gradientbackground.js';
import Img from '../cloudflareImage.js';
import ImageTriangle from '../../public/images/illustrations/triangle.png';
import ImageSquiggle from '../../public/images/illustrations/squiggle.png';
import ImageHelix from '../../public/images/illustrations/helix.png';
import ImageCross from '../../public/images/illustrations/cross.png';
import ImageCoil from '../../public/images/illustrations/coil.png';
import ImageCorkscrew from '../../public/images/illustrations/corkscrew.png';
import W3linkGateway from 'components/w3link_gateway/w3link_gateway';
import W3linkForm from 'components/w3link_form/w3link_form';

// ====================================================================== Export
class BlockBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.parseSectionData = this.parseSectionData.bind(this);
    this.getGridClasses = this.getGridClasses.bind(this);
    this.getColumnPushCount = this.getColumnPushCount.bind(this);
    this.getCustomComponents = this.getCustomComponents.bind(this);
    this.getComponent = this.getComponent.bind(this);
  }

  // ================================================================= Functions
  parseSectionData(array) {
    return {
      content: array.filter(item => item.type !== 'section-data'),
      data: array.find(item => item.hasOwnProperty('type') && item.type === 'section-data'),
    };
  }

  getGridClasses(sectionGrid) {
    const classList = ['grid'];
    if (Array.isArray(sectionGrid) && sectionGrid.length > 0) {
      sectionGrid.forEach(className => classList.push(`-${className}`));
    }
    return classList.join('');
  }

  getColumnPushCount(column, direction) {
    return column.cols.hasOwnProperty(`push_${direction}`) ? column.cols[`push_${direction}`] : undefined;
  }

  getCustomComponents(customizations) {
    if (Array.isArray(customizations)) {
      return (
        <>
          {customizations.map((block, index) => (
            <React.Fragment key={`${block.type}_${index}`}>{this.getComponent(block)}</React.Fragment>
          ))}
        </>
      );
    }
    return false;
  }

  getComponent(column) {
    switch (column.type) {
      case 'hero':
        return <Hero block={column} />;
      case 'text_block':
        return <TextBlock block={column} />;
      case 'image_block':
        return <ImageBlock block={column} />;
      case 'card_list_block':
        return <CardListBlock block={column} />;
      case 'slider_block':
        return <SliderBlock block={column} />;
      case 'accordion_block':
        return <AccordionBlock block={column} />;
      case 'code_preview':
        return <CodePreview block={column} />;
      case 'sectional':
        return <BlockBuilder subsections={column.subsections} />;
      case 'squiggle':
        return (
          <div id={column.id}>
            <Img alt="" src={ImageSquiggle} />
          </div>
        );
      case 'helix':
        return (
          <div id={column.id}>
            <Img alt="" src={ImageHelix} />
          </div>
        );
      case 'corkscrew':
        return (
          <div id={column.id}>
            <Img alt="" src={ImageCorkscrew} />
          </div>
        );
      case 'coil':
        return (
          <div id={column.id}>
            <Img alt="" src={ImageCoil} />
          </div>
        );
      case 'cross':
        return (
          <div id={column.id}>
            <Img alt="" src={ImageCross} />
          </div>
        );
      case 'triangle':
        return (
          <div id={column.id}>
            <Img alt="" src={ImageTriangle} />
          </div>
        );
      case 'w3link_gateway':
        return (
          <div id={column.id}>
            <W3linkGateway />
          </div>
        );
      case 'w3link_form':
        return (
          <div id={column.id}>
            <W3linkForm />
          </div>
        );
      case 'site_logo':
        return <SiteLogo id={column.id} />;
      case 'custom':
        return this.getCustomComponents(column.customizations);
      default:
        return false;
    }
  }

  // ====================================================== Template [Sectional]
  render(props) {
    const section = this.parseSectionData(this.props.subsections);

    return (
      <div className="sectionals" id={this.props.id}>
        {section.data && <GradientBackground variant={section.data.variant} />}

        {section.content.map(subsection => (
          <section id={subsection.id} key={subsection.id} className="sectional">
            <div className={clsx(this.getGridClasses(subsection.grid), subsection.classNames)}>
              {subsection.columns.map((column, index) => (
                <div
                  key={`${subsection.id}-column-${index + 1}`}
                  className={clsx(column.cols.num, `column-${index + 1}`)}
                  data-push-left={this.getColumnPushCount(column, 'left')}
                  data-push-right={this.getColumnPushCount(column, 'right')}
                >
                  <div className="column-content">{this.getComponent(column)}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }
}

export default BlockBuilder;
