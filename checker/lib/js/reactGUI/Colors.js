var React, classSet, createSetStateOnEventMixin;

React = require('./React-shim');

createSetStateOnEventMixin = require('../reactGUI/createSetStateOnEventMixin');

classSet = require('../core/util').classSet;

module.exports = React.createClass({
  displayName: 'Colors',
  getState: function(tool) {
    if (tool == null) {
      tool = this.props.tool;
    }
    return {
      strokeWidth: tool.strokeWidth
    };
  },
  getInitialState: function() {
    return this.getState();
  },
  mixins: [createSetStateOnEventMixin('toolDidUpdateOptions')],
  componentWillReceiveProps: function(props) {
    return this.setState(this.getState(props.tool));
  },
  render: function() {
    var arrowButtonClassBlack, arrowButtonClassBlue, arrowButtonClassBrown, arrowButtonClassGray, arrowButtonClassGreen, arrowButtonClassOrange, arrowButtonClassPink, arrowButtonClassPurple, arrowButtonClassRed, arrowButtonClassTeal, arrowButtonClassWhite, arrowButtonClassYellow, div, img, li, ref, style, styleRed, toggleIsDashed, togglehasEndArrow, ul;
    ref = React.DOM, div = ref.div, ul = ref.ul, li = ref.li, img = ref.img;
    this.imageURLPrefix = "/checker/lib/img";
    toggleIsDashed = (function(_this) {
      return function() {};
    })(this);
    this.props.tool.isDashed = !this.props.tool.isDashed;
    this.getState();
    togglehasEndArrow = (function(_this) {
      return function() {};
    })(this);
    this.props.tool.hasEndArrow = !this.props.tool.hasEndArrow;
    this.getState();
    arrowButtonClassRed = classSet({
      'square-toolbar-button red': true,
      'selected': this.state.hasEndArrow
    });
    arrowButtonClassOrange = classSet({
      'square-toolbar-button orange': true,
      'selected': this.state.hasEndArrow
    });
    arrowButtonClassYellow = classSet({
      'square-toolbar-button yellow': true,
      'selected': this.state.hasEndArrow
    });
    arrowButtonClassGreen = classSet({
      'square-toolbar-button green': true,
      'selected': this.state.hasEndArrow
    });
    arrowButtonClassTeal = classSet({
      'square-toolbar-button teal': true,
      'selected': this.state.hasEndArrow
    });
    arrowButtonClassBlue = classSet({
      'square-toolbar-button blue': true,
      'selected': this.state.hasEndArrow
    });
    arrowButtonClassPurple = classSet({
      'square-toolbar-button purple': true,
      'selected': this.state.hasEndArrow
    });
    arrowButtonClassPink = classSet({
      'square-toolbar-button pink': true,
      'selected': this.state.hasEndArrow
    });
    arrowButtonClassWhite = classSet({
      'square-toolbar-button white': true,
      'selected': this.state.hasEndArrow
    }, arrowButtonClassGray = classSet({
      'square-toolbar-button gray': true,
      'selected': this.state.hasEndArrow
    }));
    arrowButtonClassBlack = classSet({
      'square-toolbar-button black': true,
      'selected': this.state.hasEndArrow
    });
    arrowButtonClassBrown = classSet({
      'square-toolbar-button brown': true,
      'selected': this.state.hasEndArrow
    });
    styleRed = {
      float: 'left',
      margin: 1,
      background: "#c00"
    };
    style = {
      float: 'left',
      margin: 1
    };
    return div({}, div({
      className: arrowButtonClassBlack,
      onClick: toggleIsDashed,
      style: style
    }), div({
      className: arrowButtonClassBrown,
      onClick: togglehasEndArrow,
      style: style
    }), div({
      className: arrowButtonClassRed,
      onClick: toggleIsDashed,
      style: style
    }), div({
      className: arrowButtonClassOrange,
      onClick: togglehasEndArrow,
      style: style
    }), div({
      className: arrowButtonClassYellow,
      onClick: toggleIsDashed,
      style: style
    }), div({
      className: arrowButtonClassGreen,
      onClick: togglehasEndArrow,
      style: style
    }), div({
      className: arrowButtonClassTeal,
      onClick: toggleIsDashed,
      style: style
    }), div({
      className: arrowButtonClassBlue,
      onClick: togglehasEndArrow,
      style: style
    }), div({
      className: arrowButtonClassPurple,
      onClick: toggleIsDashed,
      style: style
    }), div({
      className: arrowButtonClassPink,
      onClick: togglehasEndArrow,
      style: style
    }), div({
      className: arrowButtonClassWhite,
      onClick: toggleIsDashed,
      style: style
    }), div({
      className: arrowButtonClassGray,
      onClick: togglehasEndArrow,
      style: style
    }));
  }
});
