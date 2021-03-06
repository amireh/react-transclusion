const invariant = require('invariant');
const assign = require('object-assign');

/**
 * This is the underlying module that allows you to register elements for
 * [[Outlet | outlets]] and define them.
 */
module.exports = function OutletManager(config = {}) {
  const exports = {};
  const outlets = {};
  const strict = config.strict !== false;

  /**
   * Define a new outlet in the layout. An outlet must be defined through this
   * API before attempting to inject into it or even render it.
   *
   * @param {String} name
   *        The outlet name.
   *
   * @throws {InvariantError}
   *         If a similar outlet with this name had already been defined.
   */
  exports.define = function(name) {
    invariant(!getOutletByName(name),
      `Outlet ${name} has already been defined.`
    );

    if (process.env.NODE_ENV !== 'production' && config.verbose) {
      console.log('Outlet defined: "%s"', name);
    }

    outlets[name] = [];
  };

  /**
   * Register an element to be rendered inside an [Outlet outlet]().
   *
   * @param {String} name
   *        The outlet ID.
   *
   * @param {Object} element
   *        A description of the element.
   *
   * @param {String} element.key
   *        **REQUIRED** - a unique identifier for the component (within that
   *        outlet.)
   *
   * @param {React.Class} element.component
   *        **REQUIRED** - the component to render inside the outlet.
   */
  exports.add = function(name, element) {
    const outlet = getOutletByName(name);

    if (!outlet) {
      if (strict) {
        invariant(false, `Unknown outlet "${name}".`);
      }

      exports.define(name);

      return exports.add(name, element);
    }

    const key = element.key || element.component && (
      element.component.displayName ||
      element.component.constructor.name
    );

    invariant(typeof key === 'string',
      `Missing @key for outlet occupant of "${name}"`
    );

    invariant(typeof element.component === 'function',
      "You must specify a React.Class as @component for the outlet component."
    );

    outlet.push(assign({}, element, { key }));
  };

  exports.getElements = function(name) {
    return getOutletByName(name) || [];
  };

  exports.isDefined = function(name) {
    return !!getOutletByName(name);
  };

  exports.reset = function(name) {
    if (name) {
      outlets[name] = null;
    }
    else {
      Object.keys(outlets).forEach(exports.reset);
    }
  };

  return exports;

  function getOutletByName(name) {
    return outlets[name];
  }
};
