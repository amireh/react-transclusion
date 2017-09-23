const React = require('react');
const { PropTypes } = React;

const OutletRenderer = Component => React.createClass({
  contextTypes: {
    outletManager: PropTypes.object.isRequired,
  },

  render() {
    return (
      <Component
        {...this.props}
        isOutletDefined={this.isDefined}
        isOutletOccupied={this.hasMatchingElements}
      />
    );
  },

  isDefined(name) {
    return this.context.outletManager.isDefined(name);
  },

  hasMatchingElements({ name, elementProps }) {
    return this.context.outletManager.getElements(name)
      .filter(x => !x.match || x.match(elementProps))
      .length > 0
    ;
  },
});

module.exports = OutletRenderer;
