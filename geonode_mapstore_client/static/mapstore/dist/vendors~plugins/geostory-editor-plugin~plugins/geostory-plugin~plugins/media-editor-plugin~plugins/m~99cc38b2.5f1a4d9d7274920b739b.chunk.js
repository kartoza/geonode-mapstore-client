(window.webpackJsonp=window.webpackJsonp||[]).push([["vendors~plugins/geostory-editor-plugin~plugins/geostory-plugin~plugins/media-editor-plugin~plugins/m~99cc38b2"],{"./MapStore2/node_modules/deep-equal/index.js":function(e,t,o){var r=o("./MapStore2/node_modules/object-keys/index.js"),n=o("./MapStore2/node_modules/is-arguments/index.js"),i=o("./MapStore2/node_modules/object-is/index.js"),p=o("./MapStore2/node_modules/is-regex/index.js"),a=o("./MapStore2/node_modules/regexp.prototype.flags/index.js"),s=o("./MapStore2/node_modules/is-date-object/index.js"),y=Date.prototype.getTime;function l(e,t,o){var f=o||{};return!!(f.strict?i(e,t):e===t)||(!e||!t||"object"!=typeof e&&"object"!=typeof t?f.strict?i(e,t):e==t:function(e,t,o){var i,f;if(typeof e!=typeof t)return!1;if(c(e)||c(t))return!1;if(e.prototype!==t.prototype)return!1;if(n(e)!==n(t))return!1;var d=p(e),m=p(t);if(d!==m)return!1;if(d||m)return e.source===t.source&&a(e)===a(t);if(s(e)&&s(t))return y.call(e)===y.call(t);var b=u(e),g=u(t);if(b!==g)return!1;if(b||g){if(e.length!==t.length)return!1;for(i=0;i<e.length;i++)if(e[i]!==t[i])return!1;return!0}if(typeof e!=typeof t)return!1;try{var j=r(e),S=r(t)}catch(e){return!1}if(j.length!==S.length)return!1;for(j.sort(),S.sort(),i=j.length-1;i>=0;i--)if(j[i]!=S[i])return!1;for(i=j.length-1;i>=0;i--)if(f=j[i],!l(e[f],t[f],o))return!1;return!0}(e,t,f))}function c(e){return null==e}function u(e){return!(!e||"object"!=typeof e||"number"!=typeof e.length)&&("function"==typeof e.copy&&"function"==typeof e.slice&&!(e.length>0&&"number"!=typeof e[0]))}e.exports=l},"./MapStore2/node_modules/define-properties/index.js":function(e,t,o){"use strict";var r=o("./MapStore2/node_modules/object-keys/index.js"),n="function"==typeof Symbol&&"symbol"==typeof Symbol("foo"),i=Object.prototype.toString,p=Array.prototype.concat,a=Object.defineProperty,s=a&&function(){var e={};try{for(var t in a(e,"x",{enumerable:!1,value:e}),e)return!1;return e.x===e}catch(e){return!1}}(),y=function(e,t,o,r){var n;(!(t in e)||"function"==typeof(n=r)&&"[object Function]"===i.call(n)&&r())&&(s?a(e,t,{configurable:!0,enumerable:!1,value:o,writable:!0}):e[t]=o)},l=function(e,t){var o=arguments.length>2?arguments[2]:{},i=r(t);n&&(i=p.call(i,Object.getOwnPropertySymbols(t)));for(var a=0;a<i.length;a+=1)y(e,i[a],t[i[a]],o[i[a]])};l.supportsDescriptors=!!s,e.exports=l},"./MapStore2/node_modules/es-abstract/GetIntrinsic.js":function(e,t,o){"use strict";var r=SyntaxError,n=Function,i=TypeError,p=function(e){try{return Function('"use strict"; return ('+e+").constructor;")()}catch(e){}},a=Object.getOwnPropertyDescriptor;if(a)try{a({},"")}catch(e){a=null}var s=function(){throw new i},y=a?function(){try{return s}catch(e){try{return a(arguments,"callee").get}catch(e){return s}}}():s,l=o("./MapStore2/node_modules/has-symbols/index.js")(),c=Object.getPrototypeOf||function(e){return e.__proto__},u=p("async function* () {}"),f=u?u.prototype:void 0,d=f?f.prototype:void 0,m="undefined"==typeof Uint8Array?void 0:c(Uint8Array),b={"%AggregateError%":"undefined"==typeof AggregateError?void 0:AggregateError,"%Array%":Array,"%ArrayBuffer%":"undefined"==typeof ArrayBuffer?void 0:ArrayBuffer,"%ArrayIteratorPrototype%":l?c([][Symbol.iterator]()):void 0,"%AsyncFromSyncIteratorPrototype%":void 0,"%AsyncFunction%":p("async function () {}"),"%AsyncGenerator%":f,"%AsyncGeneratorFunction%":u,"%AsyncIteratorPrototype%":d?c(d):void 0,"%Atomics%":"undefined"==typeof Atomics?void 0:Atomics,"%BigInt%":"undefined"==typeof BigInt?void 0:BigInt,"%Boolean%":Boolean,"%DataView%":"undefined"==typeof DataView?void 0:DataView,"%Date%":Date,"%decodeURI%":decodeURI,"%decodeURIComponent%":decodeURIComponent,"%encodeURI%":encodeURI,"%encodeURIComponent%":encodeURIComponent,"%Error%":Error,"%eval%":eval,"%EvalError%":EvalError,"%Float32Array%":"undefined"==typeof Float32Array?void 0:Float32Array,"%Float64Array%":"undefined"==typeof Float64Array?void 0:Float64Array,"%FinalizationRegistry%":"undefined"==typeof FinalizationRegistry?void 0:FinalizationRegistry,"%Function%":n,"%GeneratorFunction%":p("function* () {}"),"%Int8Array%":"undefined"==typeof Int8Array?void 0:Int8Array,"%Int16Array%":"undefined"==typeof Int16Array?void 0:Int16Array,"%Int32Array%":"undefined"==typeof Int32Array?void 0:Int32Array,"%isFinite%":isFinite,"%isNaN%":isNaN,"%IteratorPrototype%":l?c(c([][Symbol.iterator]())):void 0,"%JSON%":"object"==typeof JSON?JSON:void 0,"%Map%":"undefined"==typeof Map?void 0:Map,"%MapIteratorPrototype%":"undefined"!=typeof Map&&l?c((new Map)[Symbol.iterator]()):void 0,"%Math%":Math,"%Number%":Number,"%Object%":Object,"%parseFloat%":parseFloat,"%parseInt%":parseInt,"%Promise%":"undefined"==typeof Promise?void 0:Promise,"%Proxy%":"undefined"==typeof Proxy?void 0:Proxy,"%RangeError%":RangeError,"%ReferenceError%":ReferenceError,"%Reflect%":"undefined"==typeof Reflect?void 0:Reflect,"%RegExp%":RegExp,"%Set%":"undefined"==typeof Set?void 0:Set,"%SetIteratorPrototype%":"undefined"!=typeof Set&&l?c((new Set)[Symbol.iterator]()):void 0,"%SharedArrayBuffer%":"undefined"==typeof SharedArrayBuffer?void 0:SharedArrayBuffer,"%String%":String,"%StringIteratorPrototype%":l?c(""[Symbol.iterator]()):void 0,"%Symbol%":l?Symbol:void 0,"%SyntaxError%":r,"%ThrowTypeError%":y,"%TypedArray%":m,"%TypeError%":i,"%Uint8Array%":"undefined"==typeof Uint8Array?void 0:Uint8Array,"%Uint8ClampedArray%":"undefined"==typeof Uint8ClampedArray?void 0:Uint8ClampedArray,"%Uint16Array%":"undefined"==typeof Uint16Array?void 0:Uint16Array,"%Uint32Array%":"undefined"==typeof Uint32Array?void 0:Uint32Array,"%URIError%":URIError,"%WeakMap%":"undefined"==typeof WeakMap?void 0:WeakMap,"%WeakRef%":"undefined"==typeof WeakRef?void 0:WeakRef,"%WeakSet%":"undefined"==typeof WeakSet?void 0:WeakSet},g={"%ArrayBufferPrototype%":["ArrayBuffer","prototype"],"%ArrayPrototype%":["Array","prototype"],"%ArrayProto_entries%":["Array","prototype","entries"],"%ArrayProto_forEach%":["Array","prototype","forEach"],"%ArrayProto_keys%":["Array","prototype","keys"],"%ArrayProto_values%":["Array","prototype","values"],"%AsyncFunctionPrototype%":["AsyncFunction","prototype"],"%AsyncGenerator%":["AsyncGeneratorFunction","prototype"],"%AsyncGeneratorPrototype%":["AsyncGeneratorFunction","prototype","prototype"],"%BooleanPrototype%":["Boolean","prototype"],"%DataViewPrototype%":["DataView","prototype"],"%DatePrototype%":["Date","prototype"],"%ErrorPrototype%":["Error","prototype"],"%EvalErrorPrototype%":["EvalError","prototype"],"%Float32ArrayPrototype%":["Float32Array","prototype"],"%Float64ArrayPrototype%":["Float64Array","prototype"],"%FunctionPrototype%":["Function","prototype"],"%Generator%":["GeneratorFunction","prototype"],"%GeneratorPrototype%":["GeneratorFunction","prototype","prototype"],"%Int8ArrayPrototype%":["Int8Array","prototype"],"%Int16ArrayPrototype%":["Int16Array","prototype"],"%Int32ArrayPrototype%":["Int32Array","prototype"],"%JSONParse%":["JSON","parse"],"%JSONStringify%":["JSON","stringify"],"%MapPrototype%":["Map","prototype"],"%NumberPrototype%":["Number","prototype"],"%ObjectPrototype%":["Object","prototype"],"%ObjProto_toString%":["Object","prototype","toString"],"%ObjProto_valueOf%":["Object","prototype","valueOf"],"%PromisePrototype%":["Promise","prototype"],"%PromiseProto_then%":["Promise","prototype","then"],"%Promise_all%":["Promise","all"],"%Promise_reject%":["Promise","reject"],"%Promise_resolve%":["Promise","resolve"],"%RangeErrorPrototype%":["RangeError","prototype"],"%ReferenceErrorPrototype%":["ReferenceError","prototype"],"%RegExpPrototype%":["RegExp","prototype"],"%SetPrototype%":["Set","prototype"],"%SharedArrayBufferPrototype%":["SharedArrayBuffer","prototype"],"%StringPrototype%":["String","prototype"],"%SymbolPrototype%":["Symbol","prototype"],"%SyntaxErrorPrototype%":["SyntaxError","prototype"],"%TypedArrayPrototype%":["TypedArray","prototype"],"%TypeErrorPrototype%":["TypeError","prototype"],"%Uint8ArrayPrototype%":["Uint8Array","prototype"],"%Uint8ClampedArrayPrototype%":["Uint8ClampedArray","prototype"],"%Uint16ArrayPrototype%":["Uint16Array","prototype"],"%Uint32ArrayPrototype%":["Uint32Array","prototype"],"%URIErrorPrototype%":["URIError","prototype"],"%WeakMapPrototype%":["WeakMap","prototype"],"%WeakSetPrototype%":["WeakSet","prototype"]},j=o("./MapStore2/node_modules/function-bind/index.js"),S=o("./MapStore2/node_modules/has/src/index.js"),v=j.call(Function.call,Array.prototype.concat),h=j.call(Function.apply,Array.prototype.splice),A=j.call(Function.call,String.prototype.replace),P=/[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g,x=/\\(\\)?/g,O=function(e){var t=[];return A(e,P,(function(e,o,r,n){t[t.length]=r?A(n,x,"$1"):o||e})),t},M=function(e,t){var o,n=e;if(S(g,n)&&(n="%"+(o=g[n])[0]+"%"),S(b,n)){var p=b[n];if(void 0===p&&!t)throw new i("intrinsic "+e+" exists, but is not available. Please file an issue!");return{alias:o,name:n,value:p}}throw new r("intrinsic "+e+" does not exist!")};e.exports=function(e,t){if("string"!=typeof e||0===e.length)throw new i("intrinsic name must be a non-empty string");if(arguments.length>1&&"boolean"!=typeof t)throw new i('"allowMissing" argument must be a boolean');var o=O(e),r=o.length>0?o[0]:"",n=M("%"+r+"%",t),p=n.name,s=n.value,y=!1,l=n.alias;l&&(r=l[0],h(o,v([0,1],l)));for(var c=1,u=!0;c<o.length;c+=1){var f=o[c];if("constructor"!==f&&u||(y=!0),S(b,p="%"+(r+="."+f)+"%"))s=b[p];else if(null!=s){if(a&&c+1>=o.length){var d=a(s,f);if(u=!!d,!t&&!(f in s))throw new i("base intrinsic for "+e+" exists, but the property is not available.");s=u&&"get"in d&&!("originalValue"in d.get)?d.get:s[f]}else u=S(s,f),s=s[f];u&&!y&&(b[p]=s)}}return s}},"./MapStore2/node_modules/es-abstract/helpers/callBind.js":function(e,t,o){"use strict";var r=o("./MapStore2/node_modules/function-bind/index.js"),n=o("./MapStore2/node_modules/es-abstract/GetIntrinsic.js"),i=n("%Function.prototype.apply%"),p=n("%Function.prototype.call%"),a=n("%Reflect.apply%",!0)||r.call(p,i),s=n("%Object.defineProperty%",!0);if(s)try{s({},"a",{value:1})}catch(e){s=null}e.exports=function(){return a(r,p,arguments)};var y=function(){return a(r,i,arguments)};s?s(e.exports,"apply",{value:y}):e.exports.apply=y},"./MapStore2/node_modules/function-bind/implementation.js":function(e,t,o){"use strict";var r="Function.prototype.bind called on incompatible ",n=Array.prototype.slice,i=Object.prototype.toString;e.exports=function(e){var t=this;if("function"!=typeof t||"[object Function]"!==i.call(t))throw new TypeError(r+t);for(var o,p=n.call(arguments,1),a=function(){if(this instanceof o){var r=t.apply(this,p.concat(n.call(arguments)));return Object(r)===r?r:this}return t.apply(e,p.concat(n.call(arguments)))},s=Math.max(0,t.length-p.length),y=[],l=0;l<s;l++)y.push("$"+l);if(o=Function("binder","return function ("+y.join(",")+"){ return binder.apply(this,arguments); }")(a),t.prototype){var c=function(){};c.prototype=t.prototype,o.prototype=new c,c.prototype=null}return o}},"./MapStore2/node_modules/function-bind/index.js":function(e,t,o){"use strict";var r=o("./MapStore2/node_modules/function-bind/implementation.js");e.exports=Function.prototype.bind||r},"./MapStore2/node_modules/has-symbols/index.js":function(e,t,o){"use strict";(function(t){var r=t.Symbol,n=o("./MapStore2/node_modules/has-symbols/shams.js");e.exports=function(){return"function"==typeof r&&("function"==typeof Symbol&&("symbol"==typeof r("foo")&&("symbol"==typeof Symbol("bar")&&n())))}}).call(this,o("./node_modules/webpack/buildin/global.js"))},"./MapStore2/node_modules/has-symbols/shams.js":function(e,t,o){"use strict";e.exports=function(){if("function"!=typeof Symbol||"function"!=typeof Object.getOwnPropertySymbols)return!1;if("symbol"==typeof Symbol.iterator)return!0;var e={},t=Symbol("test"),o=Object(t);if("string"==typeof t)return!1;if("[object Symbol]"!==Object.prototype.toString.call(t))return!1;if("[object Symbol]"!==Object.prototype.toString.call(o))return!1;for(t in e[t]=42,e)return!1;if("function"==typeof Object.keys&&0!==Object.keys(e).length)return!1;if("function"==typeof Object.getOwnPropertyNames&&0!==Object.getOwnPropertyNames(e).length)return!1;var r=Object.getOwnPropertySymbols(e);if(1!==r.length||r[0]!==t)return!1;if(!Object.prototype.propertyIsEnumerable.call(e,t))return!1;if("function"==typeof Object.getOwnPropertyDescriptor){var n=Object.getOwnPropertyDescriptor(e,t);if(42!==n.value||!0!==n.enumerable)return!1}return!0}},"./MapStore2/node_modules/has/src/index.js":function(e,t,o){"use strict";var r=o("./MapStore2/node_modules/function-bind/index.js");e.exports=r.call(Function.call,Object.prototype.hasOwnProperty)},"./MapStore2/node_modules/is-arguments/index.js":function(e,t,o){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.toStringTag,n=Object.prototype.toString,i=function(e){return!(r&&e&&"object"==typeof e&&Symbol.toStringTag in e)&&"[object Arguments]"===n.call(e)},p=function(e){return!!i(e)||null!==e&&"object"==typeof e&&"number"==typeof e.length&&e.length>=0&&"[object Array]"!==n.call(e)&&"[object Function]"===n.call(e.callee)},a=function(){return i(arguments)}();i.isLegacyArguments=p,e.exports=a?i:p},"./MapStore2/node_modules/is-date-object/index.js":function(e,t,o){"use strict";var r=Date.prototype.getDay,n=Object.prototype.toString,i="function"==typeof Symbol&&"symbol"==typeof Symbol.toStringTag;e.exports=function(e){return"object"==typeof e&&null!==e&&(i?function(e){try{return r.call(e),!0}catch(e){return!1}}(e):"[object Date]"===n.call(e))}},"./MapStore2/node_modules/is-regex/index.js":function(e,t,o){"use strict";var r,n,i,p,a=o("./MapStore2/node_modules/has-symbols/index.js")()&&"symbol"==typeof Symbol.toStringTag;if(a){r=Function.call.bind(Object.prototype.hasOwnProperty),n=Function.call.bind(RegExp.prototype.exec),i={};var s=function(){throw i};p={toString:s,valueOf:s},"symbol"==typeof Symbol.toPrimitive&&(p[Symbol.toPrimitive]=s)}var y=Object.prototype.toString,l=Object.getOwnPropertyDescriptor;e.exports=a?function(e){if(!e||"object"!=typeof e)return!1;var t=l(e,"lastIndex");if(!(t&&r(t,"value")))return!1;try{n(e,p)}catch(e){return e===i}}:function(e){return!(!e||"object"!=typeof e&&"function"!=typeof e)&&"[object RegExp]"===y.call(e)}},"./MapStore2/node_modules/object-is/implementation.js":function(e,t,o){"use strict";var r=function(e){return e!=e};e.exports=function(e,t){return 0===e&&0===t?1/e==1/t:e===t||!(!r(e)||!r(t))}},"./MapStore2/node_modules/object-is/index.js":function(e,t,o){"use strict";var r=o("./MapStore2/node_modules/define-properties/index.js"),n=o("./MapStore2/node_modules/es-abstract/helpers/callBind.js"),i=o("./MapStore2/node_modules/object-is/implementation.js"),p=o("./MapStore2/node_modules/object-is/polyfill.js"),a=o("./MapStore2/node_modules/object-is/shim.js"),s=n(p(),Object);r(s,{getPolyfill:p,implementation:i,shim:a}),e.exports=s},"./MapStore2/node_modules/object-is/polyfill.js":function(e,t,o){"use strict";var r=o("./MapStore2/node_modules/object-is/implementation.js");e.exports=function(){return"function"==typeof Object.is?Object.is:r}},"./MapStore2/node_modules/object-is/shim.js":function(e,t,o){"use strict";var r=o("./MapStore2/node_modules/object-is/polyfill.js"),n=o("./MapStore2/node_modules/define-properties/index.js");e.exports=function(){var e=r();return n(Object,{is:e},{is:function(){return Object.is!==e}}),e}},"./MapStore2/node_modules/object-keys/implementation.js":function(e,t,o){"use strict";var r;if(!Object.keys){var n=Object.prototype.hasOwnProperty,i=Object.prototype.toString,p=o("./MapStore2/node_modules/object-keys/isArguments.js"),a=Object.prototype.propertyIsEnumerable,s=!a.call({toString:null},"toString"),y=a.call((function(){}),"prototype"),l=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],c=function(e){var t=e.constructor;return t&&t.prototype===e},u={$applicationCache:!0,$console:!0,$external:!0,$frame:!0,$frameElement:!0,$frames:!0,$innerHeight:!0,$innerWidth:!0,$onmozfullscreenchange:!0,$onmozfullscreenerror:!0,$outerHeight:!0,$outerWidth:!0,$pageXOffset:!0,$pageYOffset:!0,$parent:!0,$scrollLeft:!0,$scrollTop:!0,$scrollX:!0,$scrollY:!0,$self:!0,$webkitIndexedDB:!0,$webkitStorageInfo:!0,$window:!0},f=function(){if("undefined"==typeof window)return!1;for(var e in window)try{if(!u["$"+e]&&n.call(window,e)&&null!==window[e]&&"object"==typeof window[e])try{c(window[e])}catch(e){return!0}}catch(e){return!0}return!1}();r=function(e){var t=null!==e&&"object"==typeof e,o="[object Function]"===i.call(e),r=p(e),a=t&&"[object String]"===i.call(e),u=[];if(!t&&!o&&!r)throw new TypeError("Object.keys called on a non-object");var d=y&&o;if(a&&e.length>0&&!n.call(e,0))for(var m=0;m<e.length;++m)u.push(String(m));if(r&&e.length>0)for(var b=0;b<e.length;++b)u.push(String(b));else for(var g in e)d&&"prototype"===g||!n.call(e,g)||u.push(String(g));if(s)for(var j=function(e){if("undefined"==typeof window||!f)return c(e);try{return c(e)}catch(e){return!1}}(e),S=0;S<l.length;++S)j&&"constructor"===l[S]||!n.call(e,l[S])||u.push(l[S]);return u}}e.exports=r},"./MapStore2/node_modules/object-keys/index.js":function(e,t,o){"use strict";var r=Array.prototype.slice,n=o("./MapStore2/node_modules/object-keys/isArguments.js"),i=Object.keys,p=i?function(e){return i(e)}:o("./MapStore2/node_modules/object-keys/implementation.js"),a=Object.keys;p.shim=function(){Object.keys?function(){var e=Object.keys(arguments);return e&&e.length===arguments.length}(1,2)||(Object.keys=function(e){return n(e)?a(r.call(e)):a(e)}):Object.keys=p;return Object.keys||p},e.exports=p},"./MapStore2/node_modules/object-keys/isArguments.js":function(e,t,o){"use strict";var r=Object.prototype.toString;e.exports=function(e){var t=r.call(e),o="[object Arguments]"===t;return o||(o="[object Array]"!==t&&null!==e&&"object"==typeof e&&"number"==typeof e.length&&e.length>=0&&"[object Function]"===r.call(e.callee)),o}},"./MapStore2/node_modules/regexp.prototype.flags/implementation.js":function(e,t,o){"use strict";var r=Object,n=TypeError;e.exports=function(){if(null!=this&&this!==r(this))throw new n("RegExp.prototype.flags getter called on non-object");var e="";return this.global&&(e+="g"),this.ignoreCase&&(e+="i"),this.multiline&&(e+="m"),this.dotAll&&(e+="s"),this.unicode&&(e+="u"),this.sticky&&(e+="y"),e}},"./MapStore2/node_modules/regexp.prototype.flags/index.js":function(e,t,o){"use strict";var r=o("./MapStore2/node_modules/define-properties/index.js"),n=o("./MapStore2/node_modules/es-abstract/helpers/callBind.js"),i=o("./MapStore2/node_modules/regexp.prototype.flags/implementation.js"),p=o("./MapStore2/node_modules/regexp.prototype.flags/polyfill.js"),a=o("./MapStore2/node_modules/regexp.prototype.flags/shim.js"),s=n(i);r(s,{getPolyfill:p,implementation:i,shim:a}),e.exports=s},"./MapStore2/node_modules/regexp.prototype.flags/polyfill.js":function(e,t,o){"use strict";var r=o("./MapStore2/node_modules/regexp.prototype.flags/implementation.js"),n=o("./MapStore2/node_modules/define-properties/index.js").supportsDescriptors,i=Object.getOwnPropertyDescriptor,p=TypeError;e.exports=function(){if(!n)throw new p("RegExp.prototype.flags requires a true ES5 environment that supports property descriptors");if("gim"===/a/gim.flags){var e=i(RegExp.prototype,"flags");if(e&&"function"==typeof e.get&&"boolean"==typeof/a/.dotAll)return e.get}return r}},"./MapStore2/node_modules/regexp.prototype.flags/shim.js":function(e,t,o){"use strict";var r=o("./MapStore2/node_modules/define-properties/index.js").supportsDescriptors,n=o("./MapStore2/node_modules/regexp.prototype.flags/polyfill.js"),i=Object.getOwnPropertyDescriptor,p=Object.defineProperty,a=TypeError,s=Object.getPrototypeOf,y=/a/;e.exports=function(){if(!r||!s)throw new a("RegExp.prototype.flags requires a true ES5 environment that supports property descriptors");var e=n(),t=s(y),o=i(t,"flags");return o&&o.get===e||p(t,"flags",{configurable:!0,enumerable:!1,get:e}),e}}}]);