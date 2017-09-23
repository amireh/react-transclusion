const React = require('react');
const { PropTypes } = React;

const OutletProvider = React.createClass({
  childContextTypes: {
    outletManager: PropTypes.object,
  },

  propTypes: {
    children: PropTypes.node.isRequired,
    outletManager: PropTypes.object.isRequired,
  },

  getChildContext() {
    return {
      outletManager: this.props.outletManager,
    }
  },

  render() {
    return this.props.children;
  }
});

module.exports = OutletProvider;
