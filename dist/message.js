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
return webpackJsonparchitecture([3],{

/***/ 0:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),

/***/ 5:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ })

},[2]);
});