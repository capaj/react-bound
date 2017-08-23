'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var get = _interopDefault(require('lodash.get'));
var set = _interopDefault(require('lodash.set'));
var mobx = require('mobx');
var dateformat = _interopDefault(require('dateformat'));

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var nodeTypes = ['input', 'select', 'textarea'];

var fromInputToModel = function fromInputToModel(inputType, value) {
  if (inputType === 'number') return Number(value);
  if (inputType === 'date') {
    var date = new Date(value);
    if (!isFinite(date)) {
      return value;
    }
    return date;
  }
  if (inputType === 'datetime-local') {
    var _date = new Date(value);
    if (!isFinite(_date)) {
      return value;
    }
    return _date;
  }
  return value;
};

var fromModelToInput = function fromModelToInput(inputType, value) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    if (inputType === 'date') {
      return dateformat(value, 'yyyy-mm-dd');
    }
    if (inputType === 'datetime-local') {
      return value.toJSON().split('Z')[0];
    }
  }
  return value;
};

var Bound = function (_Component) {
  _inherits(Bound, _Component);

  function Bound() {
    _classCallCheck(this, Bound);

    return _possibleConstructorReturn(this, (Bound.__proto__ || Object.getPrototypeOf(Bound)).apply(this, arguments));
  }

  _createClass(Bound, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var to = this.props.to;

      if (mobx.isObservable(to)) {
        mobx.extendObservable(to, {
          $dirty: false
        });
      }
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren(props, state) {
      var _this2 = this;

      return React__default.Children.map(props.children, function (node) {
        var props = node.props,
            type = node.type;


        if (nodeTypes.includes(type)) {
          if (!props.name) {
            console.warn('node ' + node + ' lacks a name and is not bound');
          }
          if (props.hasOwnProperty('value')) {
            throw new Error('value prop should not be set for bound input elements');
          }
          var value = fromModelToInput(props.type, get(state, props.name));
          console.log(value);
          if (mobx.isObservable(state) && value === undefined) {
            // a safe guard when working with mobx state
            throw new TypeError('state path "' + props.name + '" lacks a default value');
            // const extender = {}
            // set(extender, props.name, '')
            // extendObservable(state, extender) // fro some reason this won't work
          }
          var originalOnChange = props.onChange;
          var cloneProps = {
            onChange: function onChange(ev) {
              var castedValue = fromInputToModel(props.type, ev.target.value);
              var setValue = function setValue() {
                state.$dirty = true;
                set(state, props.name, castedValue);
              };
              if (!originalOnChange) {
                return setValue();
              }
              var eventHandlerResult = originalOnChange(ev);
              if (eventHandlerResult !== false) {
                setValue();
              }
              return eventHandlerResult;
            },
            value: value
          };

          var clonedElement = React__default.cloneElement(node, cloneProps);
          return clonedElement;
        } else {
          if (props) {
            return React__default.createElement(type, props, _this2.renderChildren(props, state));
          }

          return node;
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var to = this.props.to;

      return this.renderChildren(this.props, to);
    }
  }]);

  return Bound;
}(React.Component);

module.exports = Bound;
