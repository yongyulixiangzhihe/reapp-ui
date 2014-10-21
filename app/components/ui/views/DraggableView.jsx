var React = require('react/addons');
var Merge = require('react/lib/merge');
var View = require('./View');
var TouchableArea = require('../helpers/TouchableArea');
var AnimatableContainer = require('../helpers/AnimatableContainer');
var DraggableViewBehavior = require('./DraggableViewBehavior');
var { Scroller } = require('scroller');
var cx = React.addons.classSet;

var DraggableView = React.createClass({
  getDefaultProps() {
    return {
      layer: 1,
      behavior: DraggableViewBehavior
    };
  },

  getInitialState() {
    return {
      externalScroller: !!this.props.scroller,
      xOffset: 0,
      isClosed: false
    };
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.containerProps ?
      true :
      this.state.xOffset !== nextState.xOffset;
  },

  componentWillMount() {
    if (this.state.externalScroller) return;
    this.scroller = new Scroller(this._handleScroll, {
      bouncing: false,
      scrollingX: true,
      scrollingY: false,
      snapping: true
    });
  },

  componentDidMount() {
    this._measure();
    window.addEventListener('resize', this._measure);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this._measure);
  },

  _measure() {
    if (this.state.externalScroller) return;
    var node = this.getDOMNode();
    this.scroller.setDimensions(
      node.clientWidth,
      node.clientHeight,
      node.clientWidth * 2,
      node.clientHeight
    );
    this.scroller.setSnapSize(node.clientWidth, node.clientHeight);
    this.scroller.scrollTo(node.clientWidth, 0);
  },

  _handleScroll(left) {
    this.setState({
      xOffset: left,
      isClosed: left === 0
    });
  },

  render() {
    var containerStyleProps = (this.props.containerProps || {}).style;
    if (containerStyleProps) delete this.props.containerProps.style;
    var containerClasses = {
      closed: this.state.isClosed
    };

    if (this.props.className)
      containerClasses[this.props.className] = true;

    var containerProps = {
      className: cx(containerClasses),
      style: Merge({
        top: 0, right: 0, bottom: 0, left: 0,
        position: 'fixed',
        marginLeft: '100%',
        width: '100%'
      }, containerStyleProps)
    };

    containerProps.style.zIndex = this.props.layer + 5000;

    if (this.props.id)
      containerProps.id = this.props.id;

    if (this.props.containerProps)
      containerProps = Merge(containerProps, this.props.containerProps);

    // if no behavior passed in, use default
    if (!(this.props.containerProps || {}).translate)
      containerProps = Merge(containerProps, {
        translate: this.props.behavior.translate(this.state.xOffset)
      });

    var touchableProps = {
      style: {
        top: 0, bottom: 0, left: 0,
        position: 'absolute',
        width: 10,
        zIndex: 1000 + this.props.layer
      },
      scroller: this.props.scroller || this.scroller
    };

    if (this.state.isClosed)
      touchableProps.style.left = -10;

    return (
      AnimatableContainer(containerProps,
        TouchableArea(touchableProps),
        View(this.props.viewProps || null, this.props.children)
      )
    );
  }
});

module.exports = DraggableView;