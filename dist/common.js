/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var parentJsonpFunction = window["webpackJsonparchitecture"];
/******/ 	window["webpackJsonparchitecture"] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [], result;
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules, executeModules);
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/ 		if(executeModules) {
/******/ 			for(i=0; i < executeModules.length; i++) {
/******/ 				result = __webpack_require__(__webpack_require__.s = executeModules[i]);
/******/ 			}
/******/ 		}
/******/ 		return result;
/******/ 	};
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// objects to store loaded and loading chunks
/******/ 	var installedChunks = {
/******/ 		4: 0
/******/ 	};
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
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData === 0) {
/******/ 			return new Promise(function(resolve) { resolve(); });
/******/ 		}
/******/
/******/ 		// a Promise means "currently loading".
/******/ 		if(installedChunkData) {
/******/ 			return installedChunkData[2];
/******/ 		}
/******/
/******/ 		// setup Promise in chunk cache
/******/ 		var promise = new Promise(function(resolve, reject) {
/******/ 			installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 		});
/******/ 		installedChunkData[2] = promise;
/******/
/******/ 		// start chunk loading
/******/ 		var head = document.getElementsByTagName('head')[0];
/******/ 		var script = document.createElement('script');
/******/ 		script.type = 'text/javascript';
/******/ 		script.charset = 'utf-8';
/******/ 		script.async = true;
/******/ 		script.timeout = 120000;
/******/
/******/ 		if (__webpack_require__.nc) {
/******/ 			script.setAttribute("nonce", __webpack_require__.nc);
/******/ 		}
/******/ 		script.src = __webpack_require__.p + "" + chunkId + ".chunk.js";
/******/ 		var timeout = setTimeout(onScriptComplete, 120000);
/******/ 		script.onerror = script.onload = onScriptComplete;
/******/ 		function onScriptComplete() {
/******/ 			// avoid mem leaks in IE.
/******/ 			script.onerror = script.onload = null;
/******/ 			clearTimeout(timeout);
/******/ 			var chunk = installedChunks[chunkId];
/******/ 			if(chunk !== 0) {
/******/ 				if(chunk) {
/******/ 					chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));
/******/ 				}
/******/ 				installedChunks[chunkId] = undefined;
/******/ 			}
/******/ 		};
/******/ 		head.appendChild(script);
/******/
/******/ 		return promise;
/******/ 	};
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
/******/ 	// on error function for async loading
/******/ 	__webpack_require__.oe = function(err) { console.error(err); throw err; };
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.constructMessage = exports.toEmittable = exports.isEmittable = exports.isMessage = exports.safeParse = exports.safeStringify = exports.mergeMaps = exports.mergeMap = exports.toArray = exports.trap = exports.log = exports.suppressEvent = exports.clone = exports.cloneRecursive = exports.withProps = exports.getValidationFailures = exports.compareOffsets = exports.update = exports.merge = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ramda = __webpack_require__(0);

var _react = __webpack_require__(5);

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
 * getValidationFailures({ foo: is(String), bar: is(Function) })({ foo: "Hello", bar: "not Func" }) -> ["bar"]
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
var isMessage = exports.isMessage = function isMessage(result) {
  return result && result.prototype && result.prototype instanceof _message2.default;
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

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Activate = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ramda = __webpack_require__(0);

var _deepFreezeStrict = __webpack_require__(26);

var _deepFreezeStrict2 = _interopRequireDefault(_deepFreezeStrict);

var _util = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Message = function () {
  function Message() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Message);

    var ctor = this.constructor;
    this._check(data);
    this.data = (0, _ramda.merge)(ctor.defaults, data);

    var invalidTypes = (0, _util.getValidationFailures)(ctor.expects)(this.data);

    if (!(0, _ramda.isEmpty)(invalidTypes)) {
      throw new TypeError('Message data ' + (0, _util.safeStringify)(data) + ' failed expectations in ' + ctor.name + ': {' + (0, _ramda.join)(', ', invalidTypes) + '}');
    }

    if (opts && opts.shallow) {
      Object.freeze(this);
      Object.freeze(this.data);
    } else {
      (0, _deepFreezeStrict2.default)(this);
    }
  }

  _createClass(Message, [{
    key: '_check',
    value: function _check(data) {
      if ((0, _ramda.is)(Object, data)) {
        return;
      }
      var msg = ['Message data must be an object in message', this.constructor.name, 'but is', (0, _util.safeStringify)(data)];
      throw new Error(msg.join(' '));
    }
  }, {
    key: 'map',
    value: function map(data) {
      return new this.constructor((0, _ramda.merge)(this.data, data));
    }
  }]);

  return Message;
}();

Message.defaults = {};
Message.expects = {};
exports.default = Message;

var Activate = exports.Activate = function (_Message) {
  _inherits(Activate, _Message);

  function Activate() {
    _classCallCheck(this, Activate);

    return _possibleConstructorReturn(this, (Activate.__proto__ || Object.getPrototypeOf(Activate)).apply(this, arguments));
  }

  return Activate;
}(Message);

/***/ }),

/***/ 26:
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

/******/ });