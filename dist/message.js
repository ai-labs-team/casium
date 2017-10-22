(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ramda"), require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["ramda", "react"], factory);
	else if(typeof exports === 'object')
		exports["architecture"] = factory(require("ramda"), require("react"));
	else
		root["architecture"] = factory(root["ramda"], root["react"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_4__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.constructMessage = exports.toEmittable = exports.isEmittable = exports.isMessage = exports.safeParse = exports.safeStringify = exports.mergeMaps = exports.mergeMap = exports.toArray = exports.trap = exports.log = exports.suppressEvent = exports.clone = exports.cloneRecursive = exports.withProps = exports.getValidationFailures = exports.compareOffsets = exports.update = exports.merge = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ramda = __webpack_require__(0);

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _message = __webpack_require__(2);

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Deep-merges two objects, overwriting left-hand keys with right-hand keys, unionizing arrays.
 *
 * @param  {Object} left
 * @param  {Object} right
 * @return {Object}
 */
var merge = exports.merge = (0, _ramda.mergeDeepWith)(function (left, right) {
  return (0, _ramda.all)((0, _ramda.is)(Array), [left, right]) ? (0, _ramda.union)(left, right) : right;
});

/**
 * Convenience function for handlers that only update state with fixed values,
 * i.e. `[FooMessage, state => merge(state, { bar: true })]` becomes
 * `[FooMessage, update({ bar: true })]`
 */
var update = exports.update = (0, _ramda.flip)(_ramda.merge);

/**
 * Returns the count of offsets that are equal between two arrays. Useful for determining
 * if one array is the prefix of another, i.e.:
 *
 * ```
 * compareOffsets([1,2,3], [1,2,3,4,5]) -> true
 * compareOffsets([1,2,3,5], [1,2,3,4,5]) -> false
 * ```
 *
 * @param  {Array} a 'Prefix' array
 * @param  {Array} b Array to compare against
 * @return {Boolean} Returns true if `a` is the prefix of `b`.
 */
var compareOffsets = exports.compareOffsets = (0, _ramda.curry)(function (a, b) {
  return (0, _ramda.all)((0, _ramda.equals)(true), (0, _ramda.zipWith)(_ramda.equals, a, b));
});

/**
 * Accepts a validator object where the values are functions that return boolean, and
 * returns a function that accepts an object to check against the validator.
 *
 * @example
 * ```
 * getValidationFailures({ foo: is(String), bar: is(Function) })
 *   ({ foo: "Hello", bar: "not Func" }) -> ["bar"]
 * ```
 */
var getValidationFailures = exports.getValidationFailures = function getValidationFailures(spec) {
  return (0, _ramda.pipe)((0, _ramda.pickAll)((0, _ramda.keys)(spec)), (0, _ramda.evolve)(spec), (0, _ramda.filter)(_ramda.not), _ramda.keys);
};

var isFunctionWithNumArgs = function isFunctionWithNumArgs(numArgs) {
  return (0, _ramda.both)((0, _ramda.is)(Function), (0, _ramda.propEq)('length', numArgs));
};

var isObjectAndAllValuesAreFunctions = (0, _ramda.both)((0, _ramda.is)(Object), (0, _ramda.pipe)(_ramda.values, (0, _ramda.all)((0, _ramda.is)(Function))));

var assertValid = function assertValid(fnMap, component) {
  var spec = { fnMap: isObjectAndAllValuesAreFunctions, component: isFunctionWithNumArgs(1) };
  var failures = getValidationFailures(spec)({ fnMap: fnMap, component: component });

  if (!(0, _ramda.isEmpty)(failures)) {
    throw new TypeError('withProps failed on types: ' + failures.join(', '));
  }
};

/**
 * Accepts an object of key/function pairs and a pure component function, and returns
 * a new pure component that will generate and inject new props into the pass component
 * function.
 * @param  {Object<Function>} An object hash of functions used to generate new props
 * @param  {Component} A pure function that returns React DOM
 * @params {Object} Accepts props passed from parent
 * @return {Component} Returns a new component that generates new props from passed props
 *
 * @example
 * ```
 * const FullName = (props) => (<span>{props.fullName}</span>);
 *
 * const Name = withProps(
 *   {
 *     fullName: (props) => `${props.first} ${props.last}`
 *   },
 *   FullName
 * );
 *
 * <Name first="Bob" last="Loblaw" />
 * ```
 */
var withProps = exports.withProps = (0, _ramda.curry)(function (fnMap, component, props) {
  assertValid(fnMap, component, props);
  return component(merge(props, (0, _ramda.map)(function (fn) {
    return fn(props);
  }, fnMap)));
});

var cloneRecursive = exports.cloneRecursive = function cloneRecursive(children, newProps) {
  return _react.Children.map(children, function (child) {
    var mapProps = function mapProps(child) {
      var props = (0, _ramda.is)(Function, newProps) ? newProps(child) : newProps;
      var hasChildren = child.props && child.props.children;
      var mapper = hasChildren && (0, _ramda.is)(Array, child.props.children) ? _ramda.identity : (0, _ramda.nth)(0);
      var children = hasChildren ? mapper(cloneRecursive(child.props.children, newProps)) : null;
      return merge(props || {}, { children: children });
    };

    return _react2.default.isValidElement(child) ? _react2.default.cloneElement(child, mapProps(child)) : child;
  });
};

var clone = exports.clone = function clone(children, newProps) {
  return _react.Children.map(children, function (child) {
    return _react2.default.cloneElement(child, merge(_react2.default.isValidElement(child) ? newProps : {}, {
      children: child.props.children
    }));
  });
};

var suppressEvent = exports.suppressEvent = function suppressEvent(e) {
  e.preventDefault();
  return e;
};

/**
 * Logs a value with a message and returns the value. Good for inspecting complex
 * function pipelines.
 */
var log = exports.log = (0, _ramda.curry)(function (msg, val) {
  console.log(msg, val); // eslint-disable-line no-console
  return val;
});

/**
 * Provides a functional interface for catching and handling errors.
 *
 * @param  {Function} handler A handler function to call when an error is thrown.
 * @param  {Function} fn A function to trap errors on.
 * @return {Function} Returns a function that, when called, passes its arguments to the
 *                    wrapped function. If the call succeeds, the it returns the result
 *                    of calling the wrapped function, otherwise returns the result of
 *                    passing the error (along with the arguments) to the handler.
 */
var trap = exports.trap = (0, _ramda.curry)(function (handler, fn) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    try {
      return fn.apply(undefined, args);
    } catch (e) {
      return handler.apply(undefined, [e].concat(args));
    }
  };
});

/**
 * Converts a value to an array... unless it's already an array, then it just returns it.
 * @type {[type]}
 */
var toArray = exports.toArray = (0, _ramda.ifElse)((0, _ramda.is)(Array), _ramda.identity, Array.of);

/**
 * Helper functions for reducing effect Maps into a single Map.
 */
var mergeMap = exports.mergeMap = function mergeMap(first, second) {
  return new Map([].concat(_toConsumableArray(first), _toConsumableArray(second)));
};
var mergeMaps = exports.mergeMaps = (0, _ramda.reduce)(mergeMap, new Map([]));

/**
 * Safely stringifies a JavaScript value to prevent error-ception in `app.result()`.
 */
var safeStringify = exports.safeStringify = function safeStringify(val) {
  try {
    return JSON.stringify(val);
  } catch (e) {
    return '{ unrepresentable value }';
  }
};

/**
 * Safely parses a JavaScript value to prevent error-ception.
 */
var safeParse = exports.safeParse = function safeParse(val) {
  try {
    return JSON.parse(val);
  } catch (e) {
    return undefined;
  }
};

/**
 * Checks that a value is a message constructor.
 */
var isMessage = exports.isMessage = function isMessage(val) {
  return val && val.prototype && val.prototype instanceof _message2.default;
};

/**
 * Checks that a value is emittable as a message constructor
 */
var isEmittable = exports.isEmittable = (0, _ramda.either)(isMessage, (0, _ramda.both)((0, _ramda.is)(Array), (0, _ramda.pipe)((0, _ramda.nth)(0), isMessage)));

var toEmittable = exports.toEmittable = (0, _ramda.ifElse)((0, _ramda.is)(Array), _ramda.identity, function (type) {
  return [type, {}];
});

/**
 * Maps an emittable and message data to a message.
 */
var constructMessage = exports.constructMessage = (0, _ramda.curry)(function (msgType, data) {
  var _toEmittable = toEmittable(msgType),
      _toEmittable2 = _slicedToArray(_toEmittable, 2),
      type = _toEmittable2[0],
      extra = _toEmittable2[1];

  return new type(merge(data, extra));
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var deep_freeze_strict_1 = __webpack_require__(5);
var ramda_1 = __webpack_require__(0);
var util_1 = __webpack_require__(1);
var Message = /** @class */ (function () {
    function Message(data, opts) {
        if (data === void 0) { data = {}; }
        if (opts === void 0) { opts = {}; }
        var ctor = this.constructor;
        this.check(data);
        this.data = ramda_1.merge(ctor.defaults, data);
        var invalidTypes = util_1.getValidationFailures(ctor.expects)(this.data);
        if (!ramda_1.isEmpty(invalidTypes)) {
            var msgData = util_1.safeStringify(data), types = ramda_1.join(', ', invalidTypes);
            throw new TypeError("Message data " + msgData + " failed expectations in " + ctor.name + ": " + types);
        }
        if (opts && opts.shallow) {
            Object.freeze(this);
            Object.freeze(this.data);
        }
        else {
            deep_freeze_strict_1.default(this);
        }
    }
    Message.prototype.check = function (data) {
        if (ramda_1.is(Object, data)) {
            return;
        }
        throw new Error([
            'Message data must be an object in message',
            this.constructor.name,
            'but is',
            util_1.safeStringify(data),
        ].join(' '));
    };
    Message.prototype.map = function (data) {
        return new this.constructor(ramda_1.merge(this.data, data));
    };
    Message.defaults = {};
    Message.expects = {};
    return Message;
}());
exports.default = Message;
var Activate = /** @class */ (function (_super) {
    __extends(Activate, _super);
    function Activate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Activate;
}(Message));
exports.Activate = Activate;


/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = function deepFreeze (o) {
  Object.freeze(o);

  var oIsFunction = typeof o === "function";
  var hasOwnProp = Object.prototype.hasOwnProperty;

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (hasOwnProp.call(o, prop)
    && (oIsFunction ? prop !== 'caller' && prop !== 'callee' && prop !== 'arguments' : true )
    && o[prop] !== null
    && (typeof o[prop] === "object" || typeof o[prop] === "function")
    && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });
  
  return o;
};


/***/ })
/******/ ]);
});
//# sourceMappingURL=message.js.map