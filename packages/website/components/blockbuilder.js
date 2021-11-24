import React from 'react'
import clsx from 'clsx';

import Hero from './hero'
import TextBlock from './textblock'
import ImageBlock from './imageblock'

class BlockBuilder extends React.Component {
  constructor(props) {
    super(props)
    this.getComponent = this.getComponent.bind(this);
  }

  getCustomComponents (customizations) {
    if (Array.isArray(customizations)){
      return (
        <>
          {customizations.map(block => (
            <>
            { this.getComponent(block) }
            </>
          ))}
        </>
      )
    }
    return false
  }

  getComponent (column) {
    switch (column.type) {
      case 'hero' : return <Hero block={column}/>;
      case 'text_block' : return <TextBlock block={column}/>;
      case 'image_block' : return <ImageBlock block={column}/>;
      case 'card_list_block' : return <CardListBlock block={column}/>;
      case 'sectional' : return <BlockBuilder subsections={column.subsections} />;
      case 'custom' : return this.getCustomComponents(column.customizations)
    }
  }

  render(props) {
    return(
      <div class="sectionals">
        {this.props.subsections.map(subsection => (
          <section
            id={subsection.id}
            key={subsection.id}
            class="sectional">
            <div className="grid">
              {subsection.columns.map((column, index) => (
                <div
                  key={`${subsection.id}-column-${index}`}
                  className={ clsx("col-count", `column-${index}`) }
                  data-push-left="off-count"
                  data-push-right="off-count">
                  <div class="column-content">
                    { this.getComponent(column) }
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    )
  }
}

export default BlockBuilder
