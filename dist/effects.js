(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ramda"), require("react"), require("axios"), require("js-cookie"));
	else if(typeof define === 'function' && define.amd)
		define(["ramda", "react", "axios", "js-cookie"], factory);
	else if(typeof exports === 'object')
		exports["architecture"] = factory(require("ramda"), require("react"), require("axios"), require("js-cookie"));
	else
		root["architecture"] = factory(root["ramda"], root["react"], root["axios"], root["js-cookie"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_13__, __WEBPACK_EXTERNAL_MODULE_22__) {
return webpackJsonparchitecture([1,3],[
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */,
/* 2 */,
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
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

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


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Timeout = exports.Back = exports.PushHistory = exports.ReplaceHistory = undefined;

var _ramda = __webpack_require__(0);

var _message = __webpack_require__(2);

var _message2 = _interopRequireDefault(_message);

var _util = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReplaceHistory = exports.ReplaceHistory = function (_Message) {
  _inherits(ReplaceHistory, _Message);

  function ReplaceHistory() {
    _classCallCheck(this, ReplaceHistory);

    return _possibleConstructorReturn(this, (ReplaceHistory.__proto__ || Object.getPrototypeOf(ReplaceHistory)).apply(this, arguments));
  }

  return ReplaceHistory;
}(_message2.default);

ReplaceHistory.expects = { path: (0, _ramda.is)(String) };

var PushHistory = exports.PushHistory = function (_Message2) {
  _inherits(PushHistory, _Message2);

  function PushHistory() {
    _classCallCheck(this, PushHistory);

    return _possibleConstructorReturn(this, (PushHistory.__proto__ || Object.getPrototypeOf(PushHistory)).apply(this, arguments));
  }

  return PushHistory;
}(_message2.default);

PushHistory.expects = { path: (0, _ramda.is)(String) };

var Back = exports.Back = function (_Message3) {
  _inherits(Back, _Message3);

  function Back() {
    _classCallCheck(this, Back);

    return _possibleConstructorReturn(this, (Back.__proto__ || Object.getPrototypeOf(Back)).apply(this, arguments));
  }

  return Back;
}(_message2.default);

var Timeout = exports.Timeout = function (_Message4) {
  _inherits(Timeout, _Message4);

  function Timeout() {
    _classCallCheck(this, Timeout);

    return _possibleConstructorReturn(this, (Timeout.__proto__ || Object.getPrototypeOf(Timeout)).apply(this, arguments));
  }

  return Timeout;
}(_message2.default);

Timeout.expects = { result: _util.isEmittable, timeout: (0, _ramda.is)(Number) };

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
  key: (0, _ramda.is)(String),
  value: (0, _ramda.either)((0, _ramda.is)(Object), (0, _ramda.is)(String)),
  path: (0, _ramda.either)((0, _ramda.is)(String), _ramda.isNil),
  expires: (0, _ramda.either)((0, _ramda.is)(Date), _ramda.isNil)
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

var parsePath = exports.parsePath = function parsePath(path) {
  var pathname = path;
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

  return {
    pathname: pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash
  };
};

var createPath = exports.createPath = function createPath(location) {
  var pathname = location.pathname;
  var search = location.search;
  var hash = location.hash;

  var path = pathname || '/';

  if (search && search !== '?') path += search.charAt(0) === '?' ? search : '?' + search;

  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : '#' + hash;

  return path;
};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = __webpack_require__(1);

var _http = __webpack_require__(12);

var _http2 = _interopRequireDefault(_http);

var _browser = __webpack_require__(14);

var _browser2 = _interopRequireDefault(_browser);

var _cookies = __webpack_require__(21);

var _cookies2 = _interopRequireDefault(_cookies);

var _local_storage = __webpack_require__(23);

var _local_storage2 = _interopRequireDefault(_local_storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _util.mergeMaps)([_http2.default, _browser2.default, _cookies2.default, _local_storage2.default]);

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = __webpack_require__(13);

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
/* 13 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_13__;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.history = undefined;

var _ramda = __webpack_require__(0);

var _createBrowserHistory = __webpack_require__(15);

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
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = __webpack_require__(4);

var _warning2 = _interopRequireDefault(_warning);

var _invariant = __webpack_require__(16);

var _invariant2 = _interopRequireDefault(_invariant);

var _LocationUtils = __webpack_require__(17);

var _PathUtils = __webpack_require__(10);

var _createTransitionManager = __webpack_require__(18);

var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);

var _ExecutionEnvironment = __webpack_require__(19);

var _DOMUtils = __webpack_require__(20);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';

var getHistoryState = function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/mjackson/history/pull/289
    return {};
  }
};

/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */
var createBrowserHistory = function createBrowserHistory() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  !_ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? (0, _invariant2.default)(false, 'Browser history needs a DOM') : (0, _invariant2.default)(false) : void 0;

  var globalHistory = window.history;
  var canUseHistory = (0, _DOMUtils.supportsHistory)();
  var needsHashChangeListener = !(0, _DOMUtils.supportsPopStateOnHashChange)();

  var _props$basename = props.basename;
  var basename = _props$basename === undefined ? '' : _props$basename;
  var _props$forceRefresh = props.forceRefresh;
  var forceRefresh = _props$forceRefresh === undefined ? false : _props$forceRefresh;
  var _props$getUserConfirm = props.getUserConfirmation;
  var getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm;
  var _props$keyLength = props.keyLength;
  var keyLength = _props$keyLength === undefined ? 6 : _props$keyLength;


  var getDOMLocation = function getDOMLocation(historyState) {
    var _ref = historyState || {};

    var key = _ref.key;
    var state = _ref.state;
    var _window$location = window.location;
    var pathname = _window$location.pathname;
    var search = _window$location.search;
    var hash = _window$location.hash;


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
    if (event.state === undefined) return; // Ignore extraneous popstate events in WebKit.

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
      (function () {
        var action = 'POP';

        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
          if (ok) {
            setState({ action: action, location: location });
          } else {
            revertPop(location);
          }
        });
      })();
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

  var push = function push(path, state) {
    var action = 'PUSH';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey());

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var url = basename + (0, _PathUtils.createPath)(location);
      var key = location.key;
      var state = location.state;


      if (canUseHistory) {
        globalHistory.pushState({ key: key, state: state }, null, url);

        if (forceRefresh) {
          window.location.href = url;
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);

          nextKeys.push(location.key);
          allKeys = nextKeys;

          setState({ action: action, location: location });
        }
      } else {
        process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') : void 0;

        window.location.href = url;
      }
    });
  };

  var replace = function replace(path, state) {
    var action = 'REPLACE';
    var location = (0, _LocationUtils.createLocation)(path, state, createKey());

    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;

      var url = basename + (0, _PathUtils.createPath)(location);
      var key = location.key;
      var state = location.state;


      if (canUseHistory) {
        globalHistory.replaceState({ key: key, state: state }, null, url);

        if (forceRefresh) {
          window.location.replace(url);
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);

          if (prevIndex !== -1) allKeys[prevIndex] = location.key;

          setState({ action: action, location: location });
        }
      } else {
        process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') : void 0;

        window.location.replace(url);
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
    var prompt = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

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
      return unlisten();
    };
  };

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 16 */
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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

exports.__esModule = true;
exports.locationsAreEqual = exports.createLocation = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = __webpack_require__(4);

var _warning2 = _interopRequireDefault(_warning);

var _PathUtils = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// A private helper function used to create location
// objects from the args to push/replace.
var createLocation = exports.createLocation = function createLocation(path, state, key) {
  var location = void 0;
  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = (0, _PathUtils.parsePath)(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = _extends({}, path);

    if (state !== undefined) {
      if (location.state === undefined) {
        location.state = state;
      } else {
        process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(false, 'When providing a location-like object with state as the first argument to push/replace ' + 'you should avoid providing a second "state" argument; it is ignored') : void 0;
      }
    }
  }

  location.key = key;

  return location;
};

var looseEqual = function looseEqual(a, b) {
  if (a == null) return a == b;

  var typeofA = typeof a === 'undefined' ? 'undefined' : _typeof(a);
  var typeofB = typeof b === 'undefined' ? 'undefined' : _typeof(b);

  if (typeofA !== typeofB) return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;

    return a.every(function (item, index) {
      return looseEqual(item, b[index]);
    });
  } else if (typeofA === 'object') {
    var keysOfA = Object.keys(a);
    var keysOfB = Object.keys(b);

    if (keysOfA.length !== keysOfB.length) return false;

    return keysOfA.every(function (key) {
      return looseEqual(a[key], b[key]);
    });
  }

  return a === b;
};

var locationsAreEqual = exports.locationsAreEqual = function locationsAreEqual(a, b) {
  return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.key === b.key && looseEqual(a.state, b.state);
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

exports.__esModule = true;

var _warning = __webpack_require__(4);

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createTransitionManager = function createTransitionManager() {
  var prompt = null;

  var setPrompt = function setPrompt(nextPrompt) {
    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(prompt == null, 'A history supports only one prompt at a time') : void 0;

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
          process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(false, 'A history needs a getUserConfirmation function in order to use a prompt message') : void 0;

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

  var appendListener = function appendListener(listener) {
    listeners.push(listener);

    return function () {
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  };

  var notifyListeners = function notifyListeners() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return listeners.forEach(function (listener) {
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
var canUseDOM = exports.canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
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

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = __webpack_require__(0);

var _jsCookie = __webpack_require__(22);

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
/* 22 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_22__;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = __webpack_require__(0);

var _local_storage = __webpack_require__(9);

var _util = __webpack_require__(1);

var get = window.localStorage.getItem.bind(window.localStorage);

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

/***/ })
],[11]);
});