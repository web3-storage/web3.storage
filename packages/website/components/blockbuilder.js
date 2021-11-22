import React from 'react'

import TextBlock from './textblock'

class BlockBuilder extends React.Component {
  constructor(props) {
    super(props)
    this.getComponent = this.getComponent.bind(this);
  }

  getComponent (column) {
    let component = ''
    switch (column.type) {
      case 'text_block' : return <TextBlock block={column}/>; break
      case 'image_block' : name = 'ImageBlock'; break
      case 'video_block' : name = 'VideoBlock'; break
      case 'accordion_block' : name = 'AccordionBlock'; break
      case 'card_list_block' : name = 'CardListBlock'; break
      case 'paginated_cards' : name = 'PaginatedCards'; break
      // case 'custom' : return (`<${column.component}/>`) ; break
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
                  className="col-count"
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

// {/* ======================================= [Block] Custom */}
// <template v-if="block.type === 'custom'">
//   <component
//     :is="component.name"
//     v-for="(component, componentKey) in block.customizations"
//     :key="componentKey"
//     :class="`block__${blockId}`"
//     v-bind="component.props" />
// </template>

//   {/* ================== Recursive Sectional/Block imports */}
// <BlockBuilder
//   v-else
//   :sections="block.sections" />
