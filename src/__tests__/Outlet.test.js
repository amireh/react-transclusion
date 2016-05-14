const jsdom = require('jsdom');
const React = require('react');
const { render, unmountComponentAtNode } = require('react-dom');
const OutletFactory = require('../Outlet');
const OutletManagerFactory = require('../OutletManager');
const { drill } = require('react-drill');
const { assert } = require('chai');

describe('Outlet', function() {
  let dom, window, document, container;
  let Outlet, OutletManager;

  beforeEach(function setupDOMAndSubjects() {
    dom = jsdom.jsdom();
    window = dom.defaultView;
    document = window.document;
    container = document.createElement('div');

    global.window = window;
    global.document = document;

    OutletManager = OutletManagerFactory({ strict: false });
    Outlet = OutletFactory(OutletManager);
  });

  afterEach(function() {
    Outlet = null;
    OutletManager = null;

    delete global.document;
    delete global.window;

    unmountComponentAtNode(container);
    container.remove();
    container = null;
    document = null;
    window = null;
    dom = null;
  });

  it('renders elements', function() {
    addToOutlet('foo', <div>Hello World!</div>);

    const subject = render((
      <Outlet name="foo" />
    ), container);

    assert.equal(drill(subject).node.textContent, "Hello World!");
  });

  it('renders an empty tag if there are no elements and no children', function() {
    const subject = render((
      <Outlet name="foo" />
    ), container);

    assert.equal(drill(subject).node.textContent, "");
  });

  it('renders children if there are no elements', function() {
    const subject = render((
      <Outlet name="foo">
        <span>Hello World!</span>
      </Outlet>
    ), container);

    assert.equal(drill(subject).node.textContent, "Hello World!");
  });

  it('does not render children if there are any elements', function() {
    addToOutlet('foo', <span>Hello!</span>);

    const subject = render((
      <Outlet name="foo">
        <span> World!</span>
      </Outlet>
    ), container);

    assert.equal(drill(subject).node.textContent, "Hello!");
  });

  context('when @alwaysRenderChildren is truthy...', function() {
    it('renders children even if there are elements', function() {
      addToOutlet('foo', <span>Hello</span>);

      const subject = render((
        <Outlet name="foo" alwaysRenderChildren>
          <span> World!</span>
        </Outlet>
      ), container);

      assert.equal(drill(subject).node.textContent, "Hello World!");
    });
  });

  it('accepts a custom @tagName', function() {
    const subject = render(<Outlet name="foo" tagName="ul" />, container);
    assert.equal(drill(subject).node.tagName, "UL");
  });

  it('passes down custom outlet options', function() {
    Outlet.add('foo', {
      key: 'my-test-fu',

      component: React.createClass({
        propTypes: {
          $outletOptions: React.PropTypes.shape({
            foo: React.PropTypes.string
          })
        },

        render() {
          return <span>{this.props.$outletOptions.foo}</span>;
        }
      })
    });

    const subject = render(<Outlet name="foo" options={{ foo: 'bar' }} />, container);
    assert.equal(drill(subject).node.textContent, "bar");
  });

  function addToOutlet(name, contents) {
    Outlet.add(name, {
      key: 'my-test-fu',
      component: React.createClass({
        render() {
          return contents;
        }
      }),
    });
  }
});