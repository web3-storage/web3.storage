// ===================================================================== Imports
import React from 'react';

// ====================================================================== Params
/**
 * @param Boolean props.multiple
 * @param Boolean props.toggleOnLoad
 * @param {Array} props.sections
 */

// ====================================================================== Export
class Accordion extends React.Component {
  constructor(props){
    super(props);
    this.setActiveSections = this.setActiveSections.bind(this);
    this.state = {
      active: this.props.multiple ? [] : false,
      childCount: 0
    }
  }

  setActiveSections (id) {
    if (this.props.multiple) {
      if (this.state.active.includes(id)) {
        this.setState(({ active }) => ({ active: active.filter((_id) => _id !== id) }))
      } else {
        this.setState(({ active }) => ({ active: [...active, id] }))
      }
    } else {
      if (this.state.active === id) {
        this.setState({ active: false })
      } else {
        this.setState({ active: id })
      }
    }
  }

  render(props) {
    const childrenWithProps = React.Children.map(this.props.children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          active: this.state.active,
          toggle: this.setActiveSections,
          toggleOnLoad: this.props.toggleOnLoad
        })
      }
      return child
    })

    return (
      <div className="accordion">

        { childrenWithProps }

      </div>
    )
  }
}

Accordion.defaultProps = {
  multiple: false
}

export default Accordion
