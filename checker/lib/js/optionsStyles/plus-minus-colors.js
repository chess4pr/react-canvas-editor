var Colors, React, StrokeWidthPicker, classSet, createSetStateOnEventMixin, defineOptionsStyle, i, num;

React = require('../reactGUI/React-shim');

defineOptionsStyle = require('./optionsStyles').defineOptionsStyle;

Colors = React.createFactory(require('../reactGUI/Colors'));

StrokeWidthPicker = React.createFactory(require('../reactGUI/StrokeWidthPicker'));

createSetStateOnEventMixin = require('../reactGUI/createSetStateOnEventMixin');

classSet = require('../core/util').classSet;

for (num = i = 3; i >= 2; num = --i) {
  console.log(num);
}

defineOptionsStyle('plus-minus-colors', React.createClass({
  displayName: 'PlusMinusColors',
  getState: function() {
    return {
      strokeWidth: this.props.tool.strokeWidth,
      isDashed: this.props.tool.isDashed,
      hasEndArrow: this.props.tool.hasEndArrow
    };
  },
  getInitialState: function() {
    return this.getState();
  },
  mixins: [createSetStateOnEventMixin('toolChange')],
  render: function() {
    var arrowButtonClass, dashButtonClass, div, img, li, ref, style, toggleIsDashed, togglehasEndArrow, ul;
    ref = React.DOM, div = ref.div, ul = ref.ul, li = ref.li, img = ref.img;
    toggleIsDashed = (function(_this) {
      return function() {
        _this.props.tool.isDashed = !_this.props.tool.isDashed;
        return _this.setState(_this.getState());
      };
    })(this);
    togglehasEndArrow = (function(_this) {
      return function() {
        _this.props.tool.hasEndArrow = !_this.props.tool.hasEndArrow;
        return _this.setState(_this.getState());
      };
    })(this);
    dashButtonClass = classSet({
      'square-toolbar-button': true,
      'selected': this.state.isDashed
    });
    arrowButtonClass = classSet({
      'square-toolbar-button': true,
      'selected': this.state.hasEndArrow
    });
    style = {
      float: 'left',
      margin: 1
    };
    return div({}, Colors({
      tool: this.props.tool,
      lc: this.props.lc
    }));
  }
}));

module.exports = {};
