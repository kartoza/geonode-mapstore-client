(window.webpackJsonp=window.webpackJsonp||[]).push([[26],{"./MapStore2/web/client/libs/leaflet.js":function(e,t){e.exports=window.L},"./js/components/leaflet/ArcGisMapServer.js":function(e,t,a){"use strict";a.r(t);var r=a("./MapStore2/web/client/utils/leaflet/Layers.js"),s=a("./MapStore2/web/client/libs/leaflet.js"),n=a.n(s);Object(r.registerType)("arcgis",(function(e){return n.a.esri.dynamicMapLayer({url:e.url,opacity:e.opacity||1,layers:[parseInt(e.name||0,10)]})}))}}]);