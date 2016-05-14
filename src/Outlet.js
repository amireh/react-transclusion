const React = require('react');
const assign = require('object-assign');
const { string, object, node, bool, func, } = React.PropTypes;

module.exports = function OutletFactory(outletManager) {
  /**
   * @namespace UI.Components
   *
   * An outlet is a container element that allows you to render other components
   * inside of it. These elements may be registered at boot-time, and they
   * will be rendered in the correct place in the UI at the correct time.
   */
  return React.createClass({
    displayName: 'Outlet',

    statics: {
      add: outletManager.add,
      hasMatchingElements({ name, elementProps }) {
        return outletManager.getElements(name)
          .filter(x => !x.match || x.match(elementProps))
          .length > 0
        ;
      },

      isDefined: outletManager.isDefined,
      define: outletManager.define,
      reset: outletManager.reset,
    },

    propTypes: {
      /**
       * @property {String}
       *           A unique name for this outlet. Elements will use this name to
       *           plug into it.
       */
      name: string.isRequired,

      /**
       * @property {String} [tagName="div"]
       *           The HTML tag to use for the outlet root node.
       */
      tagName: string,

      /**
       * @property {Object} [elementProps={}]
       *           The props to inject into the rendered elements, if any.
       */
      elementProps: object,

      options: object,

      /**
       * @property {React.Component}
       *
       * Children passed to the outlet are handled in a special way based on
       * the flags you specify. Generally, if children were rendered, they will
       * be placed *after* the outlet elements.
       *
       * The default behavior is to render the children only if no elements
       * were rendered (either none were defined, or none matched), but:
       *
       * - when [[@forwardChildren]] is turned on, the outlet will simply pass
       *   those children to the elements.
       *
       * - when [[@alwaysRenderChildren]] is turned on, the outlet will insert
       *   the children after any rendered elements
       */
      children: node,

      /**
       * @property {Boolean} [firstMatchingElement=false]
       *
       * Render only a single element at all times and that is the first one
       * that matches (ie, yields true in a `match()` routine it defined when it
       * was registered.)
       */
      firstMatchingElement: bool,

      /**
       * @property {Boolean} [alwaysRenderChildren=false]
       *
       * Whether we should unconditionally render the children you pass to the
       * outlet.
       */
      alwaysRenderChildren: bool,

      /**
       * @property {Boolean} [forwardChildren=false]
       *
       * Whether we should not render the children ourselves, and instead pass
       * them on to the outlet elements to render for themselves.
       *
       * This likely assumes you're expecting a single element and that it's
       * responsible for rendering those children, which is usually the case for
       * layout components.
       */
      forwardChildren: bool,

      /**
       * @property {Outlet~fnRenderElementCallback}
       *
       * Override the routine that renders a single element.
       *
       * @callback Outlet~fnRenderElementCallback
       *
       * @param {String} key
       *        The key to use for the rendered element. This *MUST* be placed.
       *
       * @param {Object} elementProps
       *        The props to render the element with.
       *
       * @param {React.Component} Component
       *        The element component type.
       */
      fnRenderElement: func,
    },

    getDefaultProps() {
      return {
        children: null,
        tagName: 'div',
        elementProps: {},
        options: {},
        alwaysRenderChildren: false,
        forwardChildren: false,
        fnRenderElement: null,
      };
    },

    render() {
      const children = [];
      const elementProps = ElementProps(this.props);
      const elementInstances = this.renderElements(elementProps);
      const hasElements = [].concat(elementInstances).filter(truthy).length > 0;

      if (hasElements) {
        children.push(elementInstances);
      }

      if (!hasElements || this.props.alwaysRenderChildren) {
        children.push(this.props.children);
      }

      return <this.props.tagName>{children}</this.props.tagName>;
    },

    renderElements(elementProps) {
      const elements = outletManager.getElements(this.props.name);

      if (this.props.firstMatchingElement) {
        return this.renderFirstMatchingElement(elements, elementProps);
      }

      if (elements.length === 0) {
        return null;
      }
      else if (elements.length === 1) {
        return this.renderElement(elements[0], elementProps);
      }
      else {
        return elements.map(this.renderElementWithProps(elementProps));
      }
    },

    renderElement(element, elementProps) {
      if (element.match && !element.match(elementProps)) {
        return null;
      }

      const Component = element.component;

      if (this.props.fnRenderElement) {
        return this.props.fnRenderElement(element.key, elementProps, Component, this.props.options);
      }
      else {
        return (
          <Component
            key={element.key}
            $outletOptions={this.props.options}
            {...elementProps}
          />
        );
      }
    },

    renderElementWithProps(elementProps) {
      return (element) => this.renderElement(element, elementProps);
    },

    renderFirstMatchingElement(elements, elementProps) {
      for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];

        if (element.match && element.match(elementProps)) {
          return this.renderElement(element, elementProps);
        }
      }

      return null;
    },
  });
};

function ElementProps(props) {
  return props.forwardChildren ?
    assign({}, props.elementProps, { children: props.children }) :
    props.elementProps
  ;
}

function truthy(x) {
  return !!x;
}