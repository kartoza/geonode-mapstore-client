(self.webpackChunkgeonode_mapstore_client=self.webpackChunkgeonode_mapstore_client||[]).push([[9587],{13292:(e,t,r)=>{var o=r(87786).pZ;e.exports=function(e){var t=[1/0,1/0,-1/0,-1/0];return o(e,(function(e){t[0]>e[0]&&(t[0]=e[0]),t[1]>e[1]&&(t[1]=e[1]),t[2]<e[0]&&(t[2]=e[0]),t[3]<e[1]&&(t[3]=e[1])})),t}},87786:(e,t,r)=>{"use strict";function o(e,t,r){if(null!==e){var n,i,a,l,u,g,y,s,f,c,p=0,m=0,h=e.type,v="FeatureCollection"===h,d="Feature"===h,w=v?e.features.length:1;for(n=0;n<w;n++)for(y=(c=!!(f=v?e.features[n].geometry:d?e.geometry:e)&&"GeometryCollection"===f.type)?f.geometries.length:1,i=0;i<y;i++){var P=0;if(null!==(g=c?f.geometries[i]:f)){s=g.coordinates;var S=g.type;switch(p=!r||"Polygon"!==S&&"MultiPolygon"!==S?0:1,S){case null:break;case"Point":t(s,m,n,P),m++,P++;break;case"LineString":case"MultiPoint":for(a=0;a<s.length;a++)t(s[a],m,n,P),m++,"MultiPoint"===S&&P++;"LineString"===S&&P++;break;case"Polygon":case"MultiLineString":for(a=0;a<s.length;a++){for(l=0;l<s[a].length-p;l++)t(s[a][l],m,n,P),m++;"MultiLineString"===S&&P++}"Polygon"===S&&P++;break;case"MultiPolygon":for(a=0;a<s.length;a++){for(l=0;l<s[a].length;l++)for(u=0;u<s[a][l].length-p;u++)t(s[a][l][u],m,n,P),m++;P++}break;case"GeometryCollection":for(a=0;a<g.geometries.length;a++)o(g.geometries[a],t,r);break;default:throw new Error("Unknown Geometry Type")}}}}}r.d(t,{pZ:()=>o})},54625:e=>{e.exports=function(e){if(!e||!e.type)return null;var r=t[e.type];return r?"geometry"===r?{type:"FeatureCollection",features:[{type:"Feature",properties:{},geometry:e}]}:"feature"===r?{type:"FeatureCollection",features:[e]}:"featurecollection"===r?e:void 0:null};var t={Point:"geometry",MultiPoint:"geometry",LineString:"geometry",MultiLineString:"geometry",Polygon:"geometry",MultiPolygon:"geometry",GeometryCollection:"geometry",Feature:"feature",FeatureCollection:"featurecollection"}},55745:(e,t,r)=>{var o=r(3465),n=o.featureCollection,i=r(98098),a=r(54625);e.exports=function(e,t,r){var l=o.distanceToDegrees(t,r),u=a(e),g=a(n(u.features.map((function(e){return function(e,t){var r=(new i.io.GeoJSONReader).read(e.geometry).buffer(t);return{type:"Feature",geometry:r=(new i.io.GeoJSONWriter).write(r),properties:{}}}(e,l)}))));return g.features.length>1?g:1===g.features.length?g.features[0]:void 0}},65442:(e,t,r)=>{var o=r(98098);e.exports=function(e,t){var r,n;r="Feature"===e.type?e.geometry:e,n="Feature"===t.type?t.geometry:t;var i=new o.io.GeoJSONReader,a=i.read(JSON.stringify(r)),l=i.read(JSON.stringify(n)),u=a.intersection(l);if(!u.isEmpty())return{type:"Feature",properties:{},geometry:(new o.io.GeoJSONWriter).write(u)}}}}]);