// ===================================================================== Imports
import React from 'react';
import ZeroAccordionHeader from 'ZeroComponents/accordion/accordionHeader';
import ZeroAccordionContent from 'ZeroComponents/accordion/accordionContent';

// ====================================================================== Params
/**
 * @param {Array} props.active
 * @param Boolean props.selected
 */
// ================================================================== Functions
function Header() {
  return null
}

function Content() {
  return null
}

function generateUID() {
  var first = (Math.random() * 46656) | 0
  var second = (Math.random() * 46656) | 0
  first = ("000" + first.toString(36)).slice(-3)
  second = ("000" + second.toString(36)).slice(-3)
  return first + second
}

// ===================================================================== Export
class AccordionSection extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      uid: generateUID()
    }
  }

  static Header = Header
  static Content = Content

  render(props) {
    const {children} = this.props
    const header = children.find(child => child.type === Header)
    const content = children.find(child => child.type === Content)

    return (
      <div class="accordion-section">

        <ZeroAccordionHeader
          uid={this.state.uid}
          toggle={this.props.toggle}>

          {header ? header.props.children : null}

        </ZeroAccordionHeader>

        <ZeroAccordionContent>

          {content ? content.props.children : null}
          
        </ZeroAccordionContent>

      </div>
    )
  }
}

export default AccordionSection
