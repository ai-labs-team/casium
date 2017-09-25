(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ramda"), require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["ramda", "react"], factory);
	else if(typeof exports === 'object')
		exports["architecture"] = factory(require("ramda"), require("react"));
	else
		root["architecture"] = factory(root["ramda"], root["react"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_5__) {
return webpackJsonparchitecture([2,3],{

/***/ 0:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),

/***/ 24:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalStorage = exports.Http = exports.Cookies = exports.Browser = undefined;

var _browser = __webpack_require__(7);

var _Browser = _interopRequireWildcard(_browser);

var _cookies = __webpack_require__(8);

var _Cookies = _interopRequireWildcard(_cookies);

var _http = __webpack_require__(6);

var _Http = _interopRequireWildcard(_http);

var _local_storage = __webpack_require__(9);

var _LocalStorage = _interopRequireWildcard(_local_storage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.Browser = _Browser;
exports.Cookies = _Cookies;
exports.Http = _Http;
exports.LocalStorage = _LocalStorage;

/***/ }),

/***/ 5:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),

/***/ 6:
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

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Back = exports.PushHistory = exports.ReplaceHistory = undefined;

var _ramda = __webpack_require__(0);

var _message = __webpack_require__(2);

var _message2 = _interopRequireDefault(_message);

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

/***/ }),

/***/ 8:
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

/***/ 9:
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

/***/ })

},[24]);
});