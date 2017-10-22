(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ramda"), require("react"), require("axios"), require("js-cookie"));
	else if(typeof define === 'function' && define.amd)
		define(["ramda", "react", "axios", "js-cookie"], factory);
	else if(typeof exports === 'object')
		exports["architecture"] = factory(require("ramda"), require("react"), require("axios"), require("js-cookie"));
	else
		root["architecture"] = factory(root["ramda"], root["react"], root["axios"], root["js-cookie"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_14__, __WEBPACK_EXTERNAL_MODULE_24__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 33);
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
/* 3 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
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


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formData = exports.Patch = exports.Options = exports.Delete = exports.Head = exports.Put = exports.Get = exports.Post = exports.Request = undefined;

var _ramda = __webpack_require__(0);

var _util = __webpack_require__(1);

var _message = __webpack_require__(2);

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Request = exports.Request = function (_Message) {
  _inherits(Request, _Message);

  function Request() {
    _classCallCheck(this, Request);

    return _possibleConstructorReturn(this, (Request.__proto__ || Object.getPrototypeOf(Request)).apply(this, arguments));
  }

  return Request;
}(_message2.default);

Request.defaults = { method: null, url: null, data: {}, params: {}, headers: {} };
Request.expects = {
  method: (0, _ramda.is)(String),
  url: (0, _ramda.is)(String),
  data: (0, _ramda.either)((0, _ramda.is)(String), (0, _ramda.is)(Object)),
  params: (0, _ramda.is)(Object),
  headers: (0, _ramda.is)(Object),
  result: _util.isEmittable,
  error: _util.isEmittable
};

var Post = exports.Post = function (_Request) {
  _inherits(Post, _Request);

  function Post() {
    _classCallCheck(this, Post);

    return _possibleConstructorReturn(this, (Post.__proto__ || Object.getPrototypeOf(Post)).apply(this, arguments));
  }

  return Post;
}(Request);

Post.defaults = { method: 'POST', url: null, data: {}, params: {}, headers: {} };

var Get = exports.Get = function (_Request2) {
  _inherits(Get, _Request2);

  function Get() {
    _classCallCheck(this, Get);

    return _possibleConstructorReturn(this, (Get.__proto__ || Object.getPrototypeOf(Get)).apply(this, arguments));
  }

  return Get;
}(Request);

Get.defaults = { method: 'GET', url: null, data: {}, params: {}, headers: {} };

var Put = exports.Put = function (_Request3) {
  _inherits(Put, _Request3);

  function Put() {
    _classCallCheck(this, Put);

    return _possibleConstructorReturn(this, (Put.__proto__ || Object.getPrototypeOf(Put)).apply(this, arguments));
  }

  return Put;
}(Request);

Put.defaults = { method: 'PUT', url: null, data: {}, params: {}, headers: {} };

var Head = exports.Head = function (_Request4) {
  _inherits(Head, _Request4);

  function Head() {
    _classCallCheck(this, Head);

    return _possibleConstructorReturn(this, (Head.__proto__ || Object.getPrototypeOf(Head)).apply(this, arguments));
  }

  return Head;
}(Request);

Head.defaults = { method: 'HEAD', url: null, data: {}, params: {}, headers: {} };

var Delete = exports.Delete = function (_Request5) {
  _inherits(Delete, _Request5);

  function Delete() {
    _classCallCheck(this, Delete);

    return _possibleConstructorReturn(this, (Delete.__proto__ || Object.getPrototypeOf(Delete)).apply(this, arguments));
  }

  return Delete;
}(Request);

Delete.defaults = { method: 'DELETE', url: null, data: {}, params: {}, headers: {} };

var Options = exports.Options = function (_Request6) {
  _inherits(Options, _Request6);

  function Options() {
    _classCallCheck(this, Options);

    return _possibleConstructorReturn(this, (Options.__proto__ || Object.getPrototypeOf(Options)).apply(this, arguments));
  }

  return Options;
}(Request);

Options.defaults = { method: 'OPTIONS', url: null, data: {}, params: {}, headers: {} };

var Patch = exports.Patch = function (_Request7) {
  _inherits(Patch, _Request7);

  function Patch() {
    _classCallCheck(this, Patch);

    return _possibleConstructorReturn(this, (Patch.__proto__ || Object.getPrototypeOf(Patch)).apply(this, arguments));
  }

  return Patch;
}(Request);

Patch.defaults = { method: 'PATCH', url: null, data: {}, params: {}, headers: {} };
var formData = exports.formData = function formData(data) {
  return (0, _ramda.keys)(data).map(function (key) {
    return [key, data[key]].map(encodeURIComponent).join('=');
  }).join('&');
};

/***/ }),
/* 7 */
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
var ramda_1 = __webpack_require__(0);
var message_1 = __webpack_require__(2);
var util_1 = __webpack_require__(1);
var ReplaceHistory = /** @class */ (function (_super) {
    __extends(ReplaceHistory, _super);
    function ReplaceHistory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReplaceHistory.expects = { path: ramda_1.is(String) };
    return ReplaceHistory;
}(message_1.default));
exports.ReplaceHistory = ReplaceHistory;
var PushHistory = /** @class */ (function (_super) {
    __extends(PushHistory, _super);
    function PushHistory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PushHistory.expects = { path: ramda_1.is(String) };
    return PushHistory;
}(message_1.default));
exports.PushHistory = PushHistory;
var Back = /** @class */ (function (_super) {
    __extends(Back, _super);
    function Back() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Back;
}(message_1.default));
exports.Back = Back;
var Timeout = /** @class */ (function (_super) {
    __extends(Timeout, _super);
    function Timeout() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Timeout.expects = { result: util_1.isEmittable, timeout: ramda_1.is(Number) };
    return Timeout;
}(message_1.default));
exports.Timeout = Timeout;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Delete = exports.Write = exports.Read = undefined;

var _ramda = __webpack_require__(0);

var _util = __webpack_require__(1);

var _message = __webpack_require__(2);

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Read = exports.Read = function (_Message) {
  _inherits(Read, _Message);

  function Read() {
    _classCallCheck(this, Read);

    return _possibleConstructorReturn(this, (Read.__proto__ || Object.getPrototypeOf(Read)).apply(this, arguments));
  }

  return Read;
}(_message2.default);

Read.expects = { key: (0, _ramda.is)(String), result: _util.isEmittable };

var Write = exports.Write = function (_Message2) {
  _inherits(Write, _Message2);

  function Write() {
    _classCallCheck(this, Write);

    return _possibleConstructorReturn(this, (Write.__proto__ || Object.getPrototypeOf(Write)).apply(this, arguments));
  }

  return Write;
}(_message2.default);

Write.expects = {
  expires: (0, _ramda.either)((0, _ramda.is)(Date), _ramda.isNil),
  key: (0, _ramda.is)(String),
  path: (0, _ramda.either)((0, _ramda.is)(String), _ramda.isNil),
  value: (0, _ramda.either)((0, _ramda.is)(Object), (0, _ramda.is)(String))
};

var Delete = exports.Delete = function (_Message3) {
  _inherits(Delete, _Message3);

  function Delete() {
    _classCallCheck(this, Delete);

    return _possibleConstructorReturn(this, (Delete.__proto__ || Object.getPrototypeOf(Delete)).apply(this, arguments));
  }

  return Delete;
}(_message2.default);

Delete.expects = { key: (0, _ramda.is)(String) };

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Clear = exports.Delete = exports.Write = exports.Read = undefined;

var _ramda = __webpack_require__(0);

var _message = __webpack_require__(2);

var _message2 = _interopRequireDefault(_message);

var _util = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Read = exports.Read = function (_Message) {
  _inherits(Read, _Message);

  function Read() {
    _classCallCheck(this, Read);

    return _possibleConstructorReturn(this, (Read.__proto__ || Object.getPrototypeOf(Read)).apply(this, arguments));
  }

  return Read;
}(_message2.default);

Read.expects = { key: (0, _ramda.is)(String), result: _util.isEmittable };

var Write = exports.Write = function (_Message2) {
  _inherits(Write, _Message2);

  function Write() {
    _classCallCheck(this, Write);

    return _possibleConstructorReturn(this, (Write.__proto__ || Object.getPrototypeOf(Write)).apply(this, arguments));
  }

  return Write;
}(_message2.default);

Write.expects = { key: (0, _ramda.is)(String), value: (0, _ramda.complement)(_ramda.isNil) };

var Delete = exports.Delete = function (_Message3) {
  _inherits(Delete, _Message3);

  function Delete() {
    _classCallCheck(this, Delete);

    return _possibleConstructorReturn(this, (Delete.__proto__ || Object.getPrototypeOf(Delete)).apply(this, arguments));
  }

  return Delete;
}(_message2.default);

Delete.expects = { key: (0, _ramda.is)(String) };

var Clear = exports.Clear = function (_Message4) {
  _inherits(Clear, _Message4);

  function Clear() {
    _classCallCheck(this, Clear);

    return _possibleConstructorReturn(this, (Clear.__proto__ || Object.getPrototypeOf(Clear)).apply(this, arguments));
  }

  return Clear;
}(_message2.default);

Clear.expects = {};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = function() {};

if (process.env.NODE_ENV !== 'production') {
  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || (/^[s\W]*$/).test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' +
        format.replace(/%s/g, function() {
          return args[argIndex++];
        });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
var addLeadingSlash = exports.addLeadingSlash = function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
};

var stripLeadingSlash = exports.stripLeadingSlash = function stripLeadingSlash(path) {
  return path.charAt(0) === '/' ? path.substr(1) : path;
};

var stripPrefix = exports.stripPrefix = function stripPrefix(path, prefix) {
  return path.indexOf(prefix) === 0 ? path.substr(prefix.length) : path;
};

var stripTrailingSlash = exports.stripTrailingSlash = function stripTrailingSlash(path) {
  return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
};

var parsePath = exports.parsePath = function parsePath(path) {
  var pathname = path || '/';
  var search = '';
  var hash = '';

  var hashIndex = pathname.indexOf('#');
  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  var searchIndex = pathname.indexOf('?');
  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  pathname = decodeURI(pathname);

  return {
    pathname: pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash
  };
};

var createPath = exports.createPath = function createPath(location) {
  var pathname = location.pathname,
      search = location.search,
      hash = location.hash;


  var path = encodeURI(pathname || '/');

  if (search && search !== '?') path += search.charAt(0) === '?' ? search : '?' + search;

  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : '#' + hash;

  return path;
};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = __webpack_require__(1);

var _http = __webpack_require__(13);

var _http2 = _interopRequireDefault(_http);

var _browser = __webpack_require__(15);

var _browser2 = _interopRequireDefault(_browser);

var _cookies = __webpack_require__(23);

var _cookies2 = _interopRequireDefault(_cookies);

var _local_storage = __webpack_require__(25);

var _local_storage2 = _interopRequireDefault(_local_storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _util.mergeMaps)([_http2.default, _browser2.default, _cookies2.default, _local_storage2.default]);

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = __webpack_require__(14);

var _axios2 = _interopRequireDefault(_axios);

var _ramda = __webpack_require__(0);

var _http = __webpack_require__(6);

var _util = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new Map([[_http.Request, function (_ref, dispatch) {
  var method = _ref.method,
      url = _ref.url,
      data = _ref.data,
      params = _ref.params,
      headers = _ref.headers,
      result = _ref.result,
      error = _ref.error,
      always = _ref.always;

  (0, _axios2.default)({ method: method, url: url, data: data, params: params, headers: headers, withCredentials: true }).then((0, _ramda.pipe)((0, _util.constructMessage)(result), dispatch)).catch((0, _ramda.pipe)((0, _util.constructMessage)(error), dispatch)).then(always && (0, _ramda.pipe)((0, _util.constructMessage)(always), dispatch) || _ramda.identity);
}]]);

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_14__;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.history = undefined;

var _ramda = __webpack_require__(0);

var _createBrowserHistory = __webpack_require__(16);

var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

var _browser = __webpack_require__(7);

var _util = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var history = exports.history = (0, _createBrowserHistory2.default)();

exports.default = new Map([[_browser.PushHistory, function (_ref) {
  var path = _ref.path,
      state = _ref.state;
  return history.push(path, state || {});
}], [_browser.ReplaceHistory, function (_ref2) {
  var path = _ref2.path,
      state = _ref2.state;
  return history.replace(path, state || {});
}], [_browser.Back, function (_ref3) {
  var state = _ref3.state;
  return history.goBack(state);
}], [_browser.Timeout, function (_ref4, dispatch) {
  var result = _ref4.result,
      timeout = _ref4.timeout;
  return setTimeout(function () {
    return (0, _ramda.pipe)((0, _util.constructMessage)(result), dispatch)({});
  }, timeout);
}]]);

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = __webpack_require__(10);

var _warning2 = _interopRequireDefault(_warning);

var _invariant = __webpack_require__(17);

var _invariant2 = _interopRequireDefault(_invariant);

var _LocationUtils = __webpack_require__(18);

var _PathUtils = __webpack_require__(11);

var _createTransitionManager = __webpack_require__(21);

var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);

var _DOMUtils = __webpack_require__(22);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';

var getHistoryState = function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    return {};
  }
};

/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */
var createBrowserHistory = function createBrowserHistory() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  (0, _invariant2.default)(_DOMUtils.canUseDOM, 'Browser history needs a DOM');

  var globalHistory = window.history;
  var canUseHistory = (0, _DOMUtils.supportsHistory)();
  var needsHashChangeListener = !(0, _DOMUtils.supportsPopStateOnHashChange)();

  var _props$forceRefresh = props.forceRefresh,
      forceRefresh = _props$forceRefresh === undefined ? false : _props$forceRefresh,
      _props$getUserConfirm = props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm,
      _props$keyLength = props.keyLength,
      keyLength = _props$keyLength === undefined ? 6 : _props$keyLength;

  var basename = props.basename ? (0, _PathUtils.stripTrailingSlash)((0, _PathUtils.addLeadingSlash)(props.basename)) : '';

  var getDOMLocation = function getDOMLocation(historyState) {
    var _ref = historyState || {},
        key = _ref.key,
        state = _ref.state;

    var _window$location = window.location,
        pathname = _window$location.pathname,
        search = _window$location.search,
        hash = _window$location.hash;


    var path = pathname + search + hash;

    if (basename) path = (0, _PathUtils.stripPrefix)(path, basename);

    return _extends({}, (0, _PathUtils.parsePath)(path), {
      state: state,
      key: key
    });
  };

  var createKey = function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  };

  var transitionManager = (0, _createTransitionManager2.default)();

  var setState = function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;

    transitionManager.notifyListeners(history.location, history.action);
  };

  var handlePopState = function handlePopState(event) {
    // Ignore extraneous popstate events in WebKit.
    if ((0, _DOMUtils.isExtraneousPopstateEvent)(event)) return;

    handlePop(getDOMLocation(event.state));
  };

  var handleHashChange = function handleHashChange() {
    handlePop(getDOMLocation(getHistoryState()));
  };

  var forceNextPop = false;

  var handlePop = function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';

      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({ action: action, location: location });
        } else {
          revertPop(location);
        }
      });
    }
  };

  var revertPop = function revertPop(fromLocation) {
    var toLocation = history.location;

    // TODO: We could probably make this more reliable by
    // keeping a list of keys we've seen in sessionStorage.
    // Instead, we just default to 0 for keys we don't know.

    var toIndex = allKeys.indexOf(toLocation.key);

    if (toIndex === -1) toIndex = 0;

    var fromIndex = allKeys.indexOf(fromLocation.key);

    if (fromIndex === -1) fromIndex = 0;

    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  };

  var initialLocation = getDOMLocation(getHistoryState());
  var allKeys = [initialLocation.key];

  // Public interface

  var createHref = function createHref(location) {
    return basename + (0, _PathUtils.createPath)(location);
  };

  var push = function push(path, state) {
    (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

    var action = 'PUSH';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var href = createHref(location);
      var key = location.key,
          state = location.state;


      if (canUseHistory) {
        globalHistory.pushState({ key: key, state: state }, null, href);

        if (forceRefresh) {
          window.location.href = href;
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);

          nextKeys.push(location.key);
          allKeys = nextKeys;

          setState({ action: action, location: location });
        }
      } else {
        (0, _warning2.default)(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');

        window.location.href = href;
      }
    });
  };

  var replace = function replace(path, state) {
    (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

    var action = 'REPLACE';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var href = createHref(location);
      var key = location.key,
          state = location.state;


      if (canUseHistory) {
        globalHistory.replaceState({ key: key, state: state }, null, href);

        if (forceRefresh) {
          window.location.replace(href);
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);

          if (prevIndex !== -1) allKeys[prevIndex] = location.key;

          setState({ action: action, location: location });
        }
      } else {
        (0, _warning2.default)(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history');

        window.location.replace(href);
      }
    });
  };

  var go = function go(n) {
    globalHistory.go(n);
  };

  var goBack = function goBack() {
    return go(-1);
  };

  var goForward = function goForward() {
    return go(1);
  };

  var listenerCount = 0;

  var checkDOMListeners = function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1) {
      (0, _DOMUtils.addEventListener)(window, PopStateEvent, handlePopState);

      if (needsHashChangeListener) (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      (0, _DOMUtils.removeEventListener)(window, PopStateEvent, handlePopState);

      if (needsHashChangeListener) (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
    }
  };

  var isBlocked = false;

  var block = function block() {
    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  };

  var listen = function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);

    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  };

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };

  return history;
};

exports.default = createBrowserHistory;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.locationsAreEqual = exports.createLocation = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _resolvePathname = __webpack_require__(19);

var _resolvePathname2 = _interopRequireDefault(_resolvePathname);

var _valueEqual = __webpack_require__(20);

var _valueEqual2 = _interopRequireDefault(_valueEqual);

var _PathUtils = __webpack_require__(11);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createLocation = exports.createLocation = function createLocation(path, state, key, currentLocation) {
  var location = void 0;
  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = (0, _PathUtils.parsePath)(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = _extends({}, path);

    if (location.pathname === undefined) location.pathname = '';

    if (location.search) {
      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
    } else {
      location.search = '';
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
    } else {
      location.hash = '';
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      location.pathname = (0, _resolvePathname2.default)(location.pathname, currentLocation.pathname);
    }
  }

  return location;
};

var locationsAreEqual = exports.locationsAreEqual = function locationsAreEqual(a, b) {
  return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.key === b.key && (0, _valueEqual2.default)(a.state, b.state);
};

/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
function isAbsolute(pathname) {
  return pathname.charAt(0) === '/';
}

// About 1.5x faster than the two-arg version of Array#splice()
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }

  list.pop();
}

// This implementation is based heavily on node's url.parse
function resolvePathname(to) {
  var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var toParts = to && to.split('/') || [];
  var fromParts = from && from.split('/') || [];

  var isToAbs = to && isAbsolute(to);
  var isFromAbs = from && isAbsolute(from);
  var mustEndAbs = isToAbs || isFromAbs;

  if (to && isAbsolute(to)) {
    // to is absolute
    fromParts = toParts;
  } else if (toParts.length) {
    // to is relative, drop the filename
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }

  if (!fromParts.length) return '/';

  var hasTrailingSlash = void 0;
  if (fromParts.length) {
    var last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  var up = 0;
  for (var i = fromParts.length; i >= 0; i--) {
    var part = fromParts[i];

    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) for (; up--; up) {
    fromParts.unshift('..');
  }if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');

  var result = fromParts.join('/');

  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';

  return result;
}

/* harmony default export */ __webpack_exports__["default"] = (resolvePathname);

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var valueEqual = function valueEqual(a, b) {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every(function (item, index) {
    return valueEqual(item, b[index]);
  });

  var aType = typeof a === 'undefined' ? 'undefined' : _typeof(a);
  var bType = typeof b === 'undefined' ? 'undefined' : _typeof(b);

  if (aType !== bType) return false;

  if (aType === 'object') {
    var aValue = a.valueOf();
    var bValue = b.valueOf();

    if (aValue !== a || bValue !== b) return valueEqual(aValue, bValue);

    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every(function (key) {
      return valueEqual(a[key], b[key]);
    });
  }

  return false;
};

exports.default = valueEqual;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _warning = __webpack_require__(10);

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createTransitionManager = function createTransitionManager() {
  var prompt = null;

  var setPrompt = function setPrompt(nextPrompt) {
    (0, _warning2.default)(prompt == null, 'A history supports only one prompt at a time');

    prompt = nextPrompt;

    return function () {
      if (prompt === nextPrompt) prompt = null;
    };
  };

  var confirmTransitionTo = function confirmTransitionTo(location, action, getUserConfirmation, callback) {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

      if (typeof result === 'string') {
        if (typeof getUserConfirmation === 'function') {
          getUserConfirmation(result, callback);
        } else {
          (0, _warning2.default)(false, 'A history needs a getUserConfirmation function in order to use a prompt message');

          callback(true);
        }
      } else {
        // Return false from a transition hook to cancel the transition.
        callback(result !== false);
      }
    } else {
      callback(true);
    }
  };

  var listeners = [];

  var appendListener = function appendListener(fn) {
    var isActive = true;

    var listener = function listener() {
      if (isActive) fn.apply(undefined, arguments);
    };

    listeners.push(listener);

    return function () {
      isActive = false;
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  };

  var notifyListeners = function notifyListeners() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    listeners.forEach(function (listener) {
      return listener.apply(undefined, args);
    });
  };

  return {
    setPrompt: setPrompt,
    confirmTransitionTo: confirmTransitionTo,
    appendListener: appendListener,
    notifyListeners: notifyListeners
  };
};

exports.default = createTransitionManager;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
var canUseDOM = exports.canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

var addEventListener = exports.addEventListener = function addEventListener(node, event, listener) {
  return node.addEventListener ? node.addEventListener(event, listener, false) : node.attachEvent('on' + event, listener);
};

var removeEventListener = exports.removeEventListener = function removeEventListener(node, event, listener) {
  return node.removeEventListener ? node.removeEventListener(event, listener, false) : node.detachEvent('on' + event, listener);
};

var getConfirmation = exports.getConfirmation = function getConfirmation(message, callback) {
  return callback(window.confirm(message));
}; // eslint-disable-line no-alert

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
var supportsHistory = exports.supportsHistory = function supportsHistory() {
  var ua = window.navigator.userAgent;

  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;

  return window.history && 'pushState' in window.history;
};

/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
var supportsPopStateOnHashChange = exports.supportsPopStateOnHashChange = function supportsPopStateOnHashChange() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
};

/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
var supportsGoWithoutReloadUsingHash = exports.supportsGoWithoutReloadUsingHash = function supportsGoWithoutReloadUsingHash() {
  return window.navigator.userAgent.indexOf('Firefox') === -1;
};

/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */
var isExtraneousPopstateEvent = exports.isExtraneousPopstateEvent = function isExtraneousPopstateEvent(event) {
  return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = __webpack_require__(0);

var _jsCookie = __webpack_require__(24);

var Cookies = _interopRequireWildcard(_jsCookie);

var _cookies = __webpack_require__(8);

var _util = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = new Map([[_cookies.Read, function (_ref, dispatch) {
  var key = _ref.key,
      result = _ref.result;
  return Promise.resolve(Cookies.getJSON(key)).then((0, _ramda.pipe)((0, _ramda.defaultTo)({}), (0, _util.constructMessage)(result), dispatch));
}], [_cookies.Write, function (_ref2) {
  var key = _ref2.key,
      value = _ref2.value,
      path = _ref2.path,
      expires = _ref2.expires;
  return Cookies.set(key, value, {
    path: path || '/',
    expires: expires || null
  });
}], [_cookies.Delete, function (_ref3) {
  var key = _ref3.key;
  return Cookies.remove(key);
}]]);

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_24__;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = __webpack_require__(0);

var _local_storage = __webpack_require__(9);

var _util = __webpack_require__(1);

var get = window && window.localStorage && window.localStorage.getItem.bind(window.localStorage) || (0, _ramda.always)('<running outside browser context>');

exports.default = new Map([[_local_storage.Read, function (_ref, dispatch) {
  var key = _ref.key,
      result = _ref.result;
  return (0, _ramda.pipe)(get, _util.safeParse, (0, _ramda.objOf)('value'), (0, _ramda.merge)({ key: key }), (0, _util.constructMessage)(result), dispatch)(key);
}], [_local_storage.Write, function (_ref2) {
  var key = _ref2.key,
      value = _ref2.value;
  return window.localStorage.setItem(key, (0, _util.safeStringify)(value));
}], [_local_storage.Delete, function (_ref3) {
  var key = _ref3.key;
  return window.localStorage.removeItem(key);
}], [_local_storage.Clear, function () {
  return window.localStorage.clear();
}]]);

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalStorage = exports.Http = exports.Cookies = exports.Browser = undefined;

var _browser = __webpack_require__(7);

var Browser = _interopRequireWildcard(_browser);

var _cookies = __webpack_require__(8);

var Cookies = _interopRequireWildcard(_cookies);

var _http = __webpack_require__(6);

var Http = _interopRequireWildcard(_http);

var _local_storage = __webpack_require__(9);

var LocalStorage = _interopRequireWildcard(_local_storage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.Browser = Browser;
exports.Cookies = Cookies;
exports.Http = Http;
exports.LocalStorage = LocalStorage;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */



/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = __webpack_require__(0);
var React = __webpack_require__(4);
var effects_1 = __webpack_require__(12);
var dispatcher_1 = __webpack_require__(34);
var exec_context_1 = __webpack_require__(31);
var state_manager_1 = __webpack_require__(36);
var view_wrapper_1 = __webpack_require__(37);
/**
 *  A global symbol that allows users to opt into what is currently the default delegate behavior
 *  i.e when a delegate is unspecified, the container is hoisted into it's parent state
 */
exports.PARENT = Symbol.for('@delegate/parent');
/**
 * Takes a value that may be an array or a Map, and converts it to a Map.
 */
var toMap = ramda_1.ifElse(ramda_1.is(Array), ramda_1.constructN(1, Map), ramda_1.identity);
/**
 * Wraps a container's view to extract container-specific props and inject `emit()` helper
 * function into the view's props.
 *
 * @param  {Function} getContainer A function that returns the container
 * @param  {Function} emit An emit function bound to the container
 * @param  {String|Array} delegate The `delegate` value passed to the container
 * @param  {Function} register A registration function that allows the container to hook
 *                    itself into the component tree
 * @param  {Component} view The view passed to the container
 * @return {Function} Returns the wrapped container view
 */
var wrapView = function (_a) {
    var env = _a.env, container = _a.container;
    /* eslint-disable react/prop-types */
    var mergeProps = ramda_1.pipe(ramda_1.defaultTo({}), ramda_1.omit(['delegate']));
    return function (props) {
        if (props === void 0) { props = {}; }
        return React.createElement(view_wrapper_1.default, {
            childProps: mergeProps(props), container: container, delegate: props.delegate || container.delegate, env: env
        });
    };
};
/**
 * Maps default values of a container definition.
 */
var mapDef = ramda_1.pipe(ramda_1.flip(ramda_1.merge)({ name: null, update: [] }), ramda_1.evolve({ update: toMap, name: ramda_1.defaultTo('UnknownContainer') }));
/**
 * Creates an execution environment for a container by providing it with a set of effects
 * handlers and an effect dispatcher.
 *
 * @param  {Map} effects A map pairing message classes to handler functions for that
 *               message type.
 * @param  {Function} dispatcher A message dispatcher function that accepts an effect
 *               map, a container message dispatcher (i.e. the update loop), and a message to
 *               dispatch. Should be a curried function.
 * @param  {Function} stateManager A function that returns a new instance of `StateManager`.
 * @return {Object} Returns an environment object with the following functions:
 *         - dispatcher: A curried function that accepts a container-bound message dispatcher
 *           and a command message
 *         - stateManager: A StateManager factory function
 *         - identity: Returns the parameters that created this environment
 */
exports.environment = function (_a) {
    var effects = _a.effects, dispatcher = _a.dispatcher, _b = _a.log, log = _b === void 0 ? null : _b, _c = _a.stateManager, stateManager = _c === void 0 ? null : _c;
    return ({
        dispatcher: dispatcher(effects),
        identity: function () { return ({ effects: effects, dispatcher: dispatcher, log: log, stateManager: stateManager }); },
        log: log || console.error.bind(console),
        stateManager: stateManager || (function () { return new state_manager_1.default(); })
    });
};
/**
 * Creates a container bound to an execution environment
 *
 * @param  {Object} env The environment
 * @param  {Object} container The container definition
 * @return {Component} Returns a renderable React component
 */
exports.withEnvironment = ramda_1.curry(function (env, containerDef) {
    var container;
    var freeze = Object.freeze, assign = Object.assign, defineProperty = Object.defineProperty;
    var fns = { identity: function () { return ramda_1.merge({}, containerDef); }, accepts: function (msgType) { return container.update.has(msgType); } };
    container = assign(mapDef(containerDef), fns);
    return freeze(defineProperty(assign(wrapView({ env: env, container: container }), fns), 'name', { value: container.name }));
});
var defaultEnv = exports.environment({ effects: effects_1.default, dispatcher: dispatcher_1.default });
/**
 * Creates a new container.
 *
 * @param  {Object} An object with the following functions:
 *         - `init`: Returns an update result, representing the initial value of the container's state.
 *           See "Update Results" below for details.
 *         - `update`: A function that accepts the current state as an object,
 *            and returns a `Map` pairing message types to handler functions.
 *            Each handler function accepts the message's data as a parameter,
 *            returns an update result. See "Update Results" below for details.
 *         - `view`: A pure component (i.e. a function that returns React DOM) — as part of
 *           its props, the component will receive an `emit` function, which can be called
 *           with a user-defined message class.
 *         - `attach`: Optional. If attaching to a Redux store, pass `store` and (optionally) `key`. The
 *           container will then subscribe to the store and propagate changes. Remember to call `reducer()`
 *           on the container and pass the resulting value to `combineReducers()` to complete the loop.
 *
 * ### Update Results
 *
 * An update result is a value returned from dispatching a message. Update results are used
 * to update the containers's state, as well as return _command messages_, which represent
 * side-effects that the container can perform, such as an HTTP request.
 *
 * Update results can be one of the following:
 *
 * - An object: to update the state without performing any actions — at a minimum, the
 *   current state must always be returned
 * - An array of `[state, message]`: to update the state _and_ perform an action, return an array
 *   with the state first, and a message object second,
 *   i.e. `[state, new Alert({ message: "Hello world!" })]`
 * - An array of `[state, [message]]`: to perform multiple actions, simply return an array of
 *   command messages
 *
 * @return {Object} returns an object with the following methods:
 *
 *  - `dispatch`: Accepts a message object to update the container's state
 *  - `state`: Returns the current state
 *  - `view`: A React wrapper component that can be rendered or embedded
 *    in another component
 *  - `reducer`: Returns a Redux-compatible reducer function. Optionally accepts a hash
 *    pairing action types to message types, to enable the container to respond to Redux actions,
 *    which will be mapped to messages.
 *  - `push`: Accepts a new state value to update the container.
 *  - `subscribe`: Accepts a callback which receives a copy of the state when it is updated.
 *  - `identity`: Returns an object containing the original values that created this container.
 *  - `accepts`: Accepts a message class and returns a boolean indicating whether the container
 *    accepts messages of that type.
 */
exports.container = exports.withEnvironment(defaultEnv);
/**
 * Returns a copy of a container, disconnected from its effects / command dispatcher.
 * Calling `dispatch()` on the container will simply return any commands issued.
 */
exports.isolate = function (ctr, opts) {
    if (opts === void 0) { opts = {}; }
    var env = exports.environment({
        dispatcher: ramda_1.curry(function (_, __, msg) { return msg; }),
        effects: new Map([]),
        log: function () { },
        stateManager: opts.stateManager && ramda_1.always(opts.stateManager) || (function () { return new state_manager_1.default(); })
    });
    var container = Object.assign(mapDef(ctr.identity()), {
        accepts: function (msgType) { return container.update.has(msgType); },
    });
    var parent = opts.relay ? { relay: ramda_1.always(opts.relay) } : null;
    var execContext = new exec_context_1.default({ env: env, parent: parent, container: container, delegate: null });
    return Object.assign(wrapView({ env: env, container: container }), {
        dispatch: execContext.dispatch.bind(execContext),
        push: execContext.push.bind(execContext),
        state: execContext.state.bind(execContext)
    });
};
var mapData = function (model, msg, relay) { return ramda_1.ifElse(ramda_1.is(Function), function (fn) { return fn(model, msg, relay); }, ramda_1.identity); };
var consCommands = function (model, msg, relay) { return ramda_1.pipe(ramda_1.splitEvery(2), ramda_1.map(function (_a) {
    var cmd = _a[0], data = _a[1];
    return new cmd(mapData(model, msg, relay)(data));
})); };
/**
 * Helper function for updaters that only issue commands. Pass in alternating command constructors and
 * command data, i.e.:
 *
 * ```
 * [FooMessage, commands(LocalStorage.Write, { key: 'foo' }, LocalStorage.Delete, { key: 'bar' })]
 * ```
 *
 * Command data arguments can also be functions that return data. These functions have the same type
 * signature as updaters:
 *
 * ```
 * [FooMessage, commands(Http.Post, (model, msg) => ({ url: '/foo', data: [model.someData, msg.otherData] }))]]
 * ```
 */
exports.commands = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (args.length % 2 !== 0) {
        throw new TypeError('commands() must be called with an equal number of command constructors & data parameters');
    }
    return function (model, msg, relay) { return [model, consCommands(model, msg, relay)(args)]; };
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _ramda = __webpack_require__(0);

var _deepFreezeStrict = __webpack_require__(5);

var _deepFreezeStrict2 = _interopRequireDefault(_deepFreezeStrict);

var _util = __webpack_require__(1);

var _app = __webpack_require__(30);

var _dev_tools = __webpack_require__(35);

var _message = __webpack_require__(2);

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var propOf = (0, _ramda.flip)(_ramda.prop);

/**
 * Walk up a container hierarchy looking for a value.
 *
 * @param  {Function} Callback to check an execution context for a value
 * @param  {Object} The starting (child) execution context to walk up from
 * @param  {*} args Arguments to pass to `cb`
 * @return {*}
 */
var walk = (0, _ramda.curry)(function (cb, exec, val) {
  return cb(exec, val) || exec.parent && walk(cb, exec.parent, val);
});

/**
 * Checks if a container or a container's ancestor handles messages of a given type
 *
 * @param  {Object} exec An instance of ExecContext
 * @param  {Function} msgType A message constructor
 * @return {Boolean} Returns true if the container (or an ancestor) has an update handler matching
 *         the given constructor, otherwise false.
 */
var handlesMsg = function handlesMsg(exec) {
  return (0, _ramda.pipe)(_util.toEmittable, (0, _ramda.nth)(0), walk(function (exec, type) {
    return exec.container.accepts(type);
  }, exec));
};

/**
 * Formats a message for showing an error that occurred as the result of a command
 *
 * @param  {Message} msg
 * @param  {Message} cmd
 * @return {string}
 */
var formatError = function formatError(msg, cmd) {
  return ['An error was thrown as the result of command ' + ((0, _dev_tools.cmdName)(cmd) || '{COMMAND UNDEFINED}'), '(' + (0, _util.safeStringify)(cmd && cmd.data) + '), which was initiated by message', msg && msg.constructor && msg.constructor.name || '{INIT}', '(' + (0, _util.safeStringify)(msg && msg.data) + ') --'].join(' ');
};

var error = (0, _ramda.curry)(function (logger, err, msg) {
  var cmd = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  return logger(formatError(msg, cmd), err) || err;
});

/**
 * Checks that a Message object is valid
 * @param  {Object} A ExecContext instance
 * @param {Object} A Message instance
 * @return {Object} Returns the message instance, otherwise throws an error if it is invalid
 */
var checkMessage = function checkMessage(exec, msg) {
  var msgType = msg && msg.constructor;

  if (msgType === Function) {
    throw new TypeError('Attempted to dispatch message constructor \'' + msg.name + '\' \u2014 should be an instance');
  }
  if (!handlesMsg(exec)(msgType)) {
    throw new TypeError('Unhandled message type \'' + msgType.name + '\' in container \'' + exec.container.name + '\'');
  }
  return msg;
};

/**
 * Attaches a container's state manager to a Redux store to receive updates.
 *
 * @param  {Object} config The attachment configuration
 * @param  {Object} container The container
 * @return {Object} Returns the store's current state to use as the container's initial state
 */
var attachStore = function attachStore(config, container) {
  var getState = function getState() {
    return (config.key && (0, _ramda.prop)(config.key) || _ramda.identity)(config.store.getState());
  };
  config.store.subscribe((0, _ramda.pipe)(getState, (0, _ramda.merge)(_ramda.__, container.state()), container.push));
  return getState();
};

/**
 * Freezes a value if that value is an object, otherwise return.
 */
var freezeObj = (0, _ramda.ifElse)((0, _ramda.is)(Object), _deepFreezeStrict2.default, _ramda.identity);

/**
 * Maps an `init()` or `update()` return value to the proper format.
 */
var result = (0, _ramda.cond)([[(0, _ramda.both)((0, _ramda.is)(Array), (0, _ramda.propEq)('length', 0)), function () {
  throw new TypeError('An empty array is an invalid value');
}], [(0, _ramda.both)((0, _ramda.is)(Array), (0, _ramda.propEq)('length', 1)), function (_ref) {
  var _ref2 = _slicedToArray(_ref, 1),
      state = _ref2[0];

  return [freezeObj(state), []];
}], [(0, _ramda.is)(Array), function (_ref3) {
  var _ref4 = _toArray(_ref3),
      state = _ref4[0],
      commands = _ref4.slice(1);

  return [freezeObj(state), commands];
}], [(0, _ramda.is)(Object), function (state) {
  return [freezeObj(state), []];
}], [(0, _ramda.always)(true), function (val) {
  throw new TypeError('Unrecognized structure ' + (0, _util.safeStringify)(val));
}]]);

/**
 * Maps a state & a message to a new state and optional command (or list of commands).
 */
var mapMessage = function mapMessage(handler, state, msg, relay) {
  if (!(0, _ramda.is)(_message2.default, msg)) {
    var ctor = msg && msg.constructor && msg.constructor.name || '{Unknown}';
    throw new TypeError('Message of type \'' + ctor + '\' is not an instance of Message');
  }
  if (!handler || !(0, _ramda.is)(Function, handler)) {
    throw new TypeError('Invalid handler for message type \'' + msg.constructor.name + '\'');
  }
  return result(handler(state, msg.data, relay));
};

/**
 * Maps an Event object to a hash that will be wrapped in a Message.
 */
var mapEvent = (0, _ramda.curry)(function (extra, event) {
  var isDomEvent = event && event.nativeEvent && (0, _ramda.is)(Object, event.target);
  var isCheckbox = isDomEvent && event.target.type && event.target.type.toLowerCase() === 'checkbox';
  var value = isDomEvent && (isCheckbox ? event.target.checked : event.target.value);
  var eventVal = isDomEvent ? _extends({ value: value }, (0, _ramda.pickBy)((0, _ramda.complement)((0, _ramda.is)(Object)), event)) : event;

  if (isDomEvent && !isCheckbox && extra.preventDefault !== false) {
    (0, _util.suppressEvent)(event);
  }
  return (0, _ramda.mergeAll)([{ event: (0, _ramda.always)(event) }, eventVal, extra]);
});

/**
 * Checks that a command's response messages (i.e. `result`, `error`, etc.) are handled by a container.
 */
var checkCmdMsgs = (0, _ramda.curry)(function (exec, cmd) {
  var unhandled = (0, _ramda.pipe)((0, _ramda.prop)('data'), _ramda.values, (0, _ramda.filter)(_util.isEmittable), (0, _ramda.filter)((0, _ramda.complement)(handlesMsg(exec))));
  var msgs = unhandled(cmd);

  if (!msgs.length) {
    return cmd;
  }
  throw new Error(['A ' + (0, _dev_tools.cmdName)(cmd) + ' command was sent from container ' + exec.container.name + ' ', 'with one or more result messages that are unhandled by the container (or its ancestors): ', msgs.map((0, _ramda.prop)('name')).join(', ')].join(''));
});

/**
 * Receives a Redux action and, if that action has been mapped to a container message constructor,
 * dispatches a message of the matching type to the container.
 *
 * @param  {Object} exec An executor bound to a container
 * @param  {Object} messageTypes An object that pairs one or more Redux action types to message
 *                  constructors
 * @param  {Object} action A Redux action
 */
var dispatchAction = function dispatchAction(exec, messageTypes, action) {
  if (action && action.type && messageTypes[action.type]) {
    exec.dispatch(new messageTypes[action.type](action));
  }
};

/**
 * Binds together a container, environment, and a state manager to handles message execution within a
 * container.
 *
 * @param  {Function} getContainer A function that returns the container context to operate in
 * @param  {Map} updateMap A Map instance pairing message constructors to update handlers
 * @param  {Function} init An initialization function that executes the container's `init` function
 *                    with the initial state.
 * @return {Object} Returns an execution handler with the following functions:
 *         - initialize: A wrapper function used to delay the container's initial execution until its API
 *           is invoked
 *         - dispatch: Accepts a message to dispatch to the container
 */

var ExecContext = function () {
  function ExecContext(_ref5) {
    var _this = this;

    var env = _ref5.env,
        container = _ref5.container,
        parent = _ref5.parent,
        delegate = _ref5.delegate;

    _classCallCheck(this, ExecContext);

    this.id = Math.round(Math.random() * Math.pow(2, 50)).toString();
    this.stateMgr = null;
    this.getState = null;
    this.parent = null;
    this.delegate = null;
    this.path = [];
    this.env = null;

    var stateMgr = parent ? null : (0, _dev_tools.intercept)(env.stateManager(container)),
        proto = this.constructor.prototype;
    var delegatePath = delegate && delegate !== _app.PARENT ? delegate : [];
    var path = (parent && parent.path || []).concat(delegatePath);
    var freeze = Object.freeze,
        assign = Object.assign;

    var hasInitialized = false;

    var run = function run(msg, _ref6) {
      var _ref7 = _slicedToArray(_ref6, 2),
          next = _ref7[0],
          cmds = _ref7[1];

      (0, _dev_tools.notify)({ context: _this, container: container, msg: msg, path: _this.path, prev: _this.getState({ path: [] }), next: next, cmds: cmds });
      _this.push(next);
      return _this.commands(msg, cmds);
    };

    var initialize = function initialize(fn) {
      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        if (!hasInitialized && container.init) {
          hasInitialized = true;
          var attach = container.attach,
              hasStore = attach && attach.store;
          var initial = hasStore ? attachStore(container.attach, container) : _this.getState() || {};
          run(null, result(container.init(initial) || {}));
        }
        return fn.call.apply(fn, [_this].concat(args));
      };
    };

    var wrapInit = (0, _ramda.pipe)((0, _ramda.map)(propOf(proto)), (0, _ramda.map)(function (fn) {
      return _defineProperty({}, fn.name, fn);
    }), _ramda.mergeAll, (0, _ramda.map)(initialize));

    freeze(assign(this, _extends({
      env: env,
      path: path,
      parent: parent,
      delegate: delegate,
      stateMgr: stateMgr,
      container: container,
      getState: stateMgr ? stateMgr.get.bind(stateMgr) : function (config) {
        return parent.state(config || { path: path });
      },
      dispatch: initialize(this.dispatch.bind(this))
    }, wrapInit(['push', 'subscribe', 'state', 'relay']))));

    Object.assign(this.dispatch, { run: run });
  }

  _createClass(ExecContext, [{
    key: 'subscribe',
    value: function subscribe(listener, config) {
      return (this.stateMgr || this.parent).subscribe(listener, config || { path: this.path });
    }
  }, {
    key: 'dispatch',
    value: function dispatch(message) {
      var _this2 = this;

      return (0, _util.trap)(error(this.env.log), function (msg) {
        var msgType = msg.constructor,
            updater = _this2.container.update.get(msgType);

        if (!updater) {
          return _this2.parent.dispatch(msg);
        }
        return _this2.dispatch.run(msg, mapMessage(updater, _this2.getState(), msg, _this2.relay()));
      })(checkMessage(this, message));
    }
  }, {
    key: 'commands',
    value: function commands(msg, cmds) {
      return (0, _ramda.pipe)(_ramda.flatten, (0, _ramda.filter)((0, _ramda.is)(Object)), (0, _ramda.map)((0, _util.trap)(error(this.env.log, _ramda.__, msg), (0, _ramda.pipe)(checkCmdMsgs(this), this.env.dispatcher(this.dispatch)))))(cmds);
    }
  }, {
    key: 'push',
    value: function push(val, config) {
      if (!this.stateMgr && !this.delegate && this.getState() !== val) {
        throw new Error('\'' + this.container.name + '\' is trying to modify the state, ' + 'but has no \'delegate\' specified. Either opt into parent modification by ' + ('giving \'' + this.container.name + '\' the delegate of the PARENT Symbol, or ') + ('not have \'' + this.container.name + '\' modify the state.'));
      }
      return this.stateMgr ? this.stateMgr.set(val, config) : this.parent.push(val, config || { path: this.path });
    }
  }, {
    key: 'state',
    value: function state(cfg) {
      return this.getState(cfg);
    }

    /**
     * Converts a container's relay map definition to a function that return's the container's relay value.
      * @param  {Object} The `name: () => value` relay map for a container
     * @param  {Object} The container to map
     * @return {Object} Converts the relay map to `name: value` by passing the state and parent relay values
     *         to each relay function.
     */

  }, {
    key: 'relay',
    value: function relay() {
      var _this3 = this;

      var parent = this.parent,
          container = this.container,
          inherited = parent && parent.relay() || {};

      return (0, _ramda.merge)(inherited, (0, _ramda.map)(function (fn) {
        return fn(_this3.state(), inherited);
      }, container.relay || {}));
    }

    /**
     * Returns a Redux-compatible reducer, which optionally accepts a map of action types to message constructors
     * which the container should handle.
     *
     * @param  {Object} msgTypes
     */

  }, {
    key: 'reducer',
    value: function reducer() {
      var _this4 = this;

      var msgTypes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return function (prev, action) {
        return dispatchAction(_this4.dispatch.run, msgTypes, action) || _this4.getState();
      };
    }

    /**
     * Returns a function that wraps a DOM event in a message and dispatches it to the attached container.
     */

  }, {
    key: 'emit',
    value: function emit(msgType) {
      var em = (0, _util.toEmittable)(msgType),
          _em = _slicedToArray(em, 2),
          type = _em[0],
          extra = _em[1],
          ctr = this.container.name,
          name = type && type.name || '??';

      if (handlesMsg(this)(em)) {
        return (0, _ramda.pipe)((0, _ramda.defaultTo)({}), mapEvent(extra), (0, _util.constructMessage)(type), this.dispatch);
      }
      throw new Error('Messages of type \'' + name + '\' are not handled by container \'' + ctr + '\' or any of its ancestors');
    }
  }]);

  return ExecContext;
}();

exports.default = ExecContext;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */



var emptyFunction = __webpack_require__(27);

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  var printWarning = function printWarning(format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  warning = function warning(condition, format) {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

module.exports = warning;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _app = __webpack_require__(30);

Object.keys(_app).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _app[key];
    }
  });
});

var _util = __webpack_require__(1);

Object.defineProperty(exports, 'mergeDeep', {
  enumerable: true,
  get: function get() {
    return _util.merge;
  }
});
Object.defineProperty(exports, 'replace', {
  enumerable: true,
  get: function get() {
    return _util.update;
  }
});
Object.defineProperty(exports, 'withProps', {
  enumerable: true,
  get: function get() {
    return _util.withProps;
  }
});
Object.defineProperty(exports, 'clone', {
  enumerable: true,
  get: function get() {
    return _util.clone;
  }
});
Object.defineProperty(exports, 'cloneRecursive', {
  enumerable: true,
  get: function get() {
    return _util.cloneRecursive;
  }
});
Object.defineProperty(exports, 'log', {
  enumerable: true,
  get: function get() {
    return _util.log;
  }
});
Object.defineProperty(exports, 'mergeMaps', {
  enumerable: true,
  get: function get() {
    return _util.mergeMaps;
  }
});
Object.defineProperty(exports, 'toArray', {
  enumerable: true,
  get: function get() {
    return _util.toArray;
  }
});

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = __webpack_require__(0);

var _message = __webpack_require__(2);

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Dispatches command messages.
 *
 * @param {Map} A map pairing command message constructors to effects handlers
 * @param {Function} dispatch A container-bound dispatch function for sending
 *        effect results (where applicable) back to containers
 * @param {Message} msg A command message to dispatch
 * @return {*} returns the result of calling the effect handler
 */
exports.default = (0, _ramda.curry)(function (effects, dispatch, msg) {
  var ctor = msg && msg.constructor;

  if (!(0, _ramda.is)(_message2.default, msg)) {
    throw new Error('Message of type \'' + (ctor && ctor.name) + '\' is not an instance of Message');
  }
  var handler = effects.get(ctor) || effects.get(Array.from(effects.keys()).find((0, _ramda.flip)(_ramda.is)(msg)));

  if (!handler) {
    throw new Error('Unhandled command message type \'' + (ctor && ctor.name) + '\'');
  }
  return handler(msg.data, dispatch);
});

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notify = exports.intercept = exports.cmdName = undefined;

var _ramda = __webpack_require__(0);

var _util = __webpack_require__(1);

var _commands = __webpack_require__(26);

var commands = _interopRequireWildcard(_commands);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var session = Date.now() + Math.random().toString(36).substr(2);
var send = function send(msg) {
  return window.postMessage(msg, '*');
},
    serialize = (0, _ramda.map)((0, _ramda.pipe)(_util.safeStringify, _util.safeParse));

var _ARCH_DEV_TOOLS_STATE = window._ARCH_DEV_TOOLS_STATE = {
  messageCounter: 0,
  root: null,
  connected: false,
  containers: [],
  contexts: {},
  queue: [],
  next: function next() {
    return ++this.messageCounter;
  },
  flush: function flush() {
    this.queue.forEach(send);
    this.queue = []; // @TODO: Maybe wait for an ACK before flushing
  }
};

var cmdName = exports.cmdName = function cmdName(cmd) {
  var mod = void 0,
      name = void 0,
      cls = void 0;

  for (mod in commands) {
    for (name in commands[mod]) {
      cls = commands[mod][name];
      if (cmd && cmd.constructor && cls === cmd.constructor) {
        return mod + '.' + name;
      }
    }
  }
  return cmd && cmd.constructor && cmd.constructor.name || '??';
};

window.addEventListener('message', function (message) {
  var data = message && message.data || {};

  if (data.from === 'ArchDevToolsPageScript' && data.state === 'initialized') {
    _ARCH_DEV_TOOLS_STATE.connected = true;
    _ARCH_DEV_TOOLS_STATE.flush();
  }

  if (data.from !== 'ArchDevToolsPanel') {
    return;
  }
  if (!_ARCH_DEV_TOOLS_STATE.root) {
    return;
  }
  var sel = data.selected;

  if (sel && sel.path && sel.next && sel.prev) {
    _ARCH_DEV_TOOLS_STATE.root.set((0, _ramda.set)((0, _ramda.lensPath)(sel.path), sel.next, sel.prev));
  }
}, false);

var intercept = exports.intercept = function intercept(stateManager) {
  return _ARCH_DEV_TOOLS_STATE.root = stateManager;
};

var notify = exports.notify = function notify(_ref) {
  var context = _ref.context,
      msg = _ref.msg,
      prev = _ref.prev,
      next = _ref.next,
      path = _ref.path,
      cmds = _ref.cmds;
  var container = context.container;


  var serialized = serialize({
    id: session + _ARCH_DEV_TOOLS_STATE.next(),
    name: container.name,
    ts: Date.now(),
    prev: prev,
    next: next,
    path: path,
    from: 'Arch',
    relay: context.relay(),
    message: msg && msg.constructor && msg.constructor.name || 'Init (' + container.name + ')',
    data: msg && msg.data,
    commands: (0, _ramda.pipe)(_ramda.flatten, (0, _ramda.filter)((0, _ramda.is)(Object)), (0, _ramda.map)(function (cmd) {
      return [cmdName(cmd), cmd.data];
    }))(cmds)
  });

  _ARCH_DEV_TOOLS_STATE.containers.includes(container) || _ARCH_DEV_TOOLS_STATE.containers.push(container);
  _ARCH_DEV_TOOLS_STATE.contexts[context.id] = context;

  if (!_ARCH_DEV_TOOLS_STATE.connected) {
    return _ARCH_DEV_TOOLS_STATE.queue.push(serialized);
  }
  _ARCH_DEV_TOOLS_STATE.flush();
  send(serialized, '*');
};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ramda = __webpack_require__(0);

var _util = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var inList = (0, _ramda.flip)(_ramda.contains);

var StateManager = function () {
  function StateManager() {
    var _this = this;

    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, StateManager);

    Object.assign(this, {
      state: state,
      listeners: [],
      _broadcast: function _broadcast(_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            path = _ref2[0],
            listener = _ref2[1];

        return listener((0, _ramda.defaultTo)({}, _this.get({ path: path })));
      }
    });
  }

  /**
   * Gets the current state, optionally with a path into the root value.
   */


  _createClass(StateManager, [{
    key: 'get',
    value: function get() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { path: [] };

      return (0, _ramda.view)((0, _ramda.lensPath)(opts && opts.path || []))(this.state);
    }

    /**
     * Pushes a new state value to the state container. Optionally accepts a path into
     * the root value to write into.
     */

  }, {
    key: 'set',
    value: function set(newState) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { path: [] };

      this.state = (0, _ramda.set)((0, _ramda.lensPath)(opts.path), newState, this.state);
      this.listeners.forEach((0, _ramda.when)((0, _ramda.both)(inList(this.listeners), (0, _ramda.pipe)((0, _ramda.nth)(0), (0, _util.compareOffsets)(opts.path))), this._broadcast));
      return this.state;
    }

    /**
     * Attaches a subscriber function that is invoked when the state is updated. Optionally
     * accepts an array representing a path into the root state value that this listener
     * should observe changes on. Returns an unsubscribe function.
     */

  }, {
    key: 'subscribe',
    value: function subscribe(listener) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { path: [] };

      var config = [opts.path, listener];
      this.listeners.push(config);

      if (this.state) {
        this._broadcast(config);
      }
      return this.unsubscribeFn(config);
    }

    /**
     * Returns an unsubscribe function for a listener.
     */

  }, {
    key: 'unsubscribeFn',
    value: function unsubscribeFn(listener) {
      var _this2 = this;

      return function () {
        var index = _this2.listeners.indexOf(listener);
        return index > -1 && _this2.listeners.splice(index, 1)[0] || false;
      };
    }
  }]);

  return StateManager;
}();

exports.default = StateManager;

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ramda = __webpack_require__(0);

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(38);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _message = __webpack_require__(2);

var _exec_context = __webpack_require__(31);

var _exec_context2 = _interopRequireDefault(_exec_context);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Component used to wrap container-defined view, for managing state and injecting
 * container-bound props.
 *
 * This component looks for `execContext` in its parent context, and propagates
 * itself with `execContext` in its childrens' contexts.
 */
var ViewWrapper = function (_Component) {
  _inherits(ViewWrapper, _Component);

  function ViewWrapper() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, ViewWrapper);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = ViewWrapper.__proto__ || Object.getPrototypeOf(ViewWrapper)).call.apply(_ref, [this].concat(args))), _this), _this.execContext = null, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ViewWrapper, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return { execContext: this.execContext };
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      var parent = this.context.execContext;
      var _props = this.props,
          container = _props.container,
          delegate = _props.delegate,
          env = _props.env,
          childProps = _props.childProps;


      if (delegate && !parent) {
        var msg = 'Attempting to delegate state property \'' + delegate + '\' with no parent container';
        throw new Error(msg);
      }
      this.execContext = new _exec_context2.default({ env: env, parent: parent, container: container, delegate: delegate });

      Object.assign(this, {
        subscriptions: [this.execContext.subscribe(this.setState.bind(this))]
      });

      if (container.accepts(_message.Activate)) {
        this.execContext.dispatch(new _message.Activate((0, _ramda.omit)(['emit'], childProps), { shallow: true }));
        return;
      }
      var state = this.execContext.state();
      this.setState(this.execContext.push((0, _ramda.merge)(state, (0, _ramda.pick)((0, _ramda.keys)(state), childProps))));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.subscriptions.forEach(function (unSub) {
        return unSub();
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var Child = this.props.container.view,
          ctx = this.execContext;
      var props = (0, _ramda.mergeAll)([this.props.childProps, ctx.state(), { emit: ctx.emit.bind(ctx) }]);
      return _react2.default.createElement(Child, props);
    }
  }]);

  return ViewWrapper;
}(_react.Component);

ViewWrapper.contextTypes = { execContext: _propTypes2.default.object };
ViewWrapper.childContextTypes = { execContext: _propTypes2.default.object };
ViewWrapper.propTypes = {
  childProps: _propTypes2.default.object.isRequired,
  container: _propTypes2.default.object.isRequired,
  delegate: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.symbol]),
  env: _propTypes2.default.object.isRequired
};
ViewWrapper.defaultProps = { delegate: null };
exports.default = ViewWrapper;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = __webpack_require__(39)(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = __webpack_require__(41)();
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



var emptyFunction = __webpack_require__(27);
var invariant = __webpack_require__(28);
var warning = __webpack_require__(32);

var ReactPropTypesSecret = __webpack_require__(29);
var checkPropTypes = __webpack_require__(40);

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning(
              false,
              'You are manually calling a React.PropTypes validation ' +
              'function for the `%s` prop on `%s`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        warning(
          false,
          'Invalid argument supplid to oneOfType. Expected an array of check functions, but ' +
          'received %s at index %s.',
          getPostfixForTypeWarning(checker),
          i
        );
        return emptyFunction.thatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



if (process.env.NODE_ENV !== 'production') {
  var invariant = __webpack_require__(28);
  var warning = __webpack_require__(32);
  var ReactPropTypesSecret = __webpack_require__(29);
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', location, typeSpecName);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

module.exports = checkPropTypes;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



var emptyFunction = __webpack_require__(27);
var invariant = __webpack_require__(28);
var ReactPropTypesSecret = __webpack_require__(29);

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};


/***/ })
/******/ ]);
});
//# sourceMappingURL=index.js.map