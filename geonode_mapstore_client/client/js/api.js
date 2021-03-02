/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from "object-assign";
import keyBy from 'lodash/keyBy';
import values from 'lodash/values';
import { setConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import { getSupportedLocales, setSupportedLocales } from '@mapstore/framework/utils/LocaleUtils';
import { setRegGeoserverRule } from '@mapstore/framework/utils/LayersUtils';
import { addApi, setApi } from "@mapstore/framework/api/persistence";
import geoNodeAPI from "@js/api/geonode";
import MapStore2JSAPI from '@mapstore/framework/jsapi/MapStore2';
import 'react-widgets/dist/css/react-widgets.css';
import 'react-select/dist/react-select.css';

setRegGeoserverRule(/\/[\w- ]*geoserver[\w- ]*\/|\/[\w- ]*gs[\w- ]*\//);

setConfigProp('themePrefix', 'msgapi');

addApi("geonode", geoNodeAPI);
setApi("geonode");

const getScriptPath = function() {
    const scriptEl = document.getElementById('ms2-api');
    return scriptEl && scriptEl.src && scriptEl.src.substring(0, scriptEl.src.lastIndexOf('/')) || '';
};

const translationsPath = __GEONODE_PROJECT_CONFIG__.translationsPath || getScriptPath() + '/../ms-translations';

// Set X-CSRFToken in axios;
const axios = require('@mapstore/framework/libs/ajax');
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

const createMapStore2Api = function(plugins, type) {
    const MapStore2 = MapStore2JSAPI.withPlugins(plugins, {
        theme: {
            path: getScriptPath() + '/themes'
        },
        noLocalConfig: true,
        translations: translationsPath
    });
    // window.MapStore2 = MapStore2;
    return assign({}, MapStore2, { create: function(container, opts) {
        if (opts && opts.localConfig) {
            Object.keys(opts.localConfig).map(function(c) {setConfigProp(c, opts.localConfig[c]); });
            // select mapLayout based on type
            setConfigProp('mapLayout', opts.localConfig?.mapLayout?.[type]);
        }
        return MapStore2.create(container, opts);
    }
    });
};
// Can be used to define more compact plugins bundle
window.initMapstore2Api = function(config, resolve) {

    // force supported locales to the selected one
    const setLocale = (localeKey) => {
        const supportedLocales = getSupportedLocales();
        const locale = supportedLocales[localeKey]
            ? { [localeKey]: supportedLocales[localeKey] }
            : { en: supportedLocales.en };
        setSupportedLocales(locale);
    };
    // Note: maptype is provided by the page template
    import('./components/' + maptype + '/ArcGisMapServer') // eslint-disable-line
        .then(() => {
            if (config === 'preview') {
                import('./previewPlugins')
                    .then((mod) => {
                        const previewPlugins = mod.default;
                        resolve(createMapStore2Api(previewPlugins, 'preview'), { setLocale });
                    });
            } else {
                import('./plugins')
                    .then((mod) => {
                        const plugins = mod.default;
                        resolve(createMapStore2Api(plugins, 'viewer'), { setLocale });
                    });
            }
        });
};
const createConfigObj = (cfg = []) => keyBy(cfg, (o) => o.name || o);

window.squashMS2PlugCfg = function(...args) {
    const config = args.reduce((cfg, arg) => {
        return Object.keys(arg).reduce((c, k) => ({ ...c, [k]: assign({}, cfg[k], (createConfigObj(arg[k])) )}), {});
    }, {});
    return Object.keys(config).reduce((c, k) => ({...c, [k]: values(config[k])}), {});
};
window.excludeMS2Plugins = function(config, exclude = []) {
    return Object.keys(config).reduce((c, k) => ({...c, [k]: config[k].filter((p) => {
        const n = p.name || p;
        return exclude.indexOf(n) === -1;
    })}), {});
};
