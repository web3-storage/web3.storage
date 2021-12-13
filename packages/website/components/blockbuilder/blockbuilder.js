// ===================================================================== Imports
import React from 'react';
import clsx from 'clsx';

import Hero from '../hero';
import TextBlock from '../textblock/textblock.js';
import ImageBlock from '../imageblock/imageblock.js';
import Card from '../card/card';
import CardListBlock from '../cardlistblock/cardlistblock';
import AccordionBlock from '../accordionblock/accordionblock';
import CodePreview from '../codepreview/codepreview';
import Squiggle from '../../assets/illustrations/squiggle';
import Helix from '../../assets/illustrations/helix';
import Corkscrew from '../../assets/illustrations/corkscrew';
import Coil from '../../assets/illustrations/coil';
import Cross from '../../assets/illustrations/cross';
import Triangle from '../../assets/illustrations/triangle';
import SiteLogo from '../../assets/icons/w3storage-logo.js';

// ====================================================================== Export
class BlockBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.getGridClasses = this.getGridClasses.bind(this);
    this.getColumnPushCount = this.getColumnPushCount.bind(this);
    this.getCustomComponents = this.getCustomComponents.bind(this);
    this.getComponent = this.getComponent.bind(this);
  }

  // ================================================================= Functions
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
      case 'card':
        return <Card block={column} />;
      case 'card_list_block':
        return <CardListBlock block={column} />;
      case 'accordion_block':
        return <AccordionBlock block={column} />;
      case 'code_preview':
        return <CodePreview block={column} />;
      case 'sectional':
        return <BlockBuilder subsections={column.subsections} />;
      case 'squiggle':
        return <Squiggle id={column.id} />;
      case 'helix':
        return <Helix id={column.id} />;
      case 'corkscrew':
        return <Corkscrew id={column.id} />;
      case 'coil':
        return <Coil id={column.id} />;
      case 'cross':
        return <Cross id={column.id} />;
      case 'triangle':
        return <Triangle id={column.id} />;
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
    return (
      <div className="sectionals" id={this.props.id}>
        {this.props.subsections.map(subsection => (
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
