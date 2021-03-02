/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import { setConfigProp, setLocalConfigurationFile } from '@mapstore/framework/utils/ConfigUtils';
import { setRegGeoserverRule } from '@mapstore/framework/utils/LayersUtils';
import { getSupportedLocales, setSupportedLocales } from '@mapstore/framework/utils/LocaleUtils';
import axios from '@mapstore/framework/libs/ajax';
import main from '@mapstore/framework/components/app/main';
import GeoStory from '@js/routes/GeoStory';
import Router, { withRoutes } from '@js/components/app/Router';
import security from '@mapstore/framework/reducers/security';
import maptype from '@mapstore/framework/reducers/maptype';
import geostory from '@mapstore/framework/reducers/geostory';
import gnresource from '@js/reducers/gnresource';
import { registerMediaAPI } from '@mapstore/framework/api/media';
import * as geoNodeMediaApi from '@js/observables/media/geonode';
import { getEndpoints } from '@js/api/geonode/v2';
import {
    setResourceType,
    setNewResource,
    setResourceId,
    setResourcePermissions
} from '@js/actions/gnresource';
import { setCurrentStory } from '@mapstore/framework/actions/geostory';
import isMobile from 'ismobilejs';
import uuid from 'uuid';

registerMediaAPI('geonode', geoNodeMediaApi);

// TODO: check styles on less files
import 'react-select/dist/react-select.css';

// Set X-CSRFToken in axios;
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

const DEFAULT_LOCALE = {};
const ConnectedRouter = connect((state) => ({
    locale: state?.locale || DEFAULT_LOCALE
}))(Router);

const getScriptPath = function() {
    const scriptEl = document.getElementById('ms2-api');
    return scriptEl && scriptEl.src && scriptEl.src.substring(0, scriptEl.src.lastIndexOf('/')) || '';
};

const routes = [{
    name: 'geostory',
    path: '/',
    component: GeoStory
}];

const setLocale = (localeKey) => {
    const supportedLocales = getSupportedLocales();
    const locale = supportedLocales[localeKey]
        ? { [localeKey]: supportedLocales[localeKey] }
        : { en: supportedLocales.en };
    setSupportedLocales(locale);
};

const getVersion = () => {
    if (!__DEVTOOLS__) {
        return __GEONODE_PROJECT_CONFIG__.version;
    }
    return 'dev';
};

window.initMapStore = function initMapStore(geoNodeMSConfig) {
    // get all v2 api endpoints
    getEndpoints()
        .then(() => {

            const {
                permissions,
                language,
                userDetails,
                defaultConfig,
                geoStoryConfig = {},
                plugins = [],
                isNewResource,
                appId
            } = geoNodeMSConfig || {};

            const currentStory = isNewResource
                // change id of new story sections and contents
                ? {
                    ...geoStoryConfig,
                    sections: geoStoryConfig?.sections
                        .map((section) => {
                            return {
                                ...section,
                                id: uuid(),
                                contents: section?.contents
                                    .map((content) => {
                                        return {
                                            ...content,
                                            id: uuid()
                                        };
                                    }) || []
                            };
                        }) || []
                }
                : geoStoryConfig;

            setLocalConfigurationFile('');
            setLocale(language);
            setRegGeoserverRule(/\/[\w- ]*geoserver[\w- ]*\/|\/[\w- ]*gs[\w- ]*\//);
            setConfigProp('translationsPath', __GEONODE_PROJECT_CONFIG__.translationsPath || [
                getScriptPath() + '/../MapStore2/web/client',
                getScriptPath() + '/../translations'
            ]);
            setConfigProp('loadAfterTheme', true);
            setConfigProp('themePrefix', 'msgapi');
            setConfigProp('plugins', plugins);

            if (defaultConfig && defaultConfig.localConfig) {
                Object.keys(defaultConfig.localConfig).forEach(function(key) {
                    setConfigProp(key, defaultConfig.localConfig[key]);
                });
            }

            if (defaultConfig && defaultConfig.proxy) {
                setConfigProp('proxyUrl', defaultConfig.proxy);
            }

            setConfigProp('initialState', {
                defaultState: {
                    maptype: {
                        mapType: "{context.mode === 'desktop' ? 'openlayers' : 'leaflet'}"
                    },
                    security: userDetails,
                    geostory: {
                        isCollapsed: false,
                        focusedContent: {},
                        currentPage: {},
                        settings: {},
                        oldSettings: {},
                        updateUrlOnScroll: false,
                        currentStory: {},
                        mode: isMobile.any || !permissions.canEdit ? 'view' : 'edit',
                        resource: {
                            canEdit: permissions.canEdit
                        }
                    }
                }
            });

            main({
                targetId: 'ms-container',
                appComponent: withRoutes(routes)(ConnectedRouter),
                pluginsDef: {
                    plugins: {},
                    requires: {}
                },
                themeCfg: {
                    path: getScriptPath() + '/themes',
                    prefixContainer: '#ms-container',
                    version: getVersion()
                },
                appReducers: {
                    geostory,
                    gnresource,
                    security,
                    maptype
                },
                initialActions: [
                    setCurrentStory.bind(null, currentStory),
                    setResourceType.bind(null, 'geostory'),
                    setResourcePermissions.bind(null, permissions),
                    ...(appId ? [setResourceId.bind(null, appId)] : []),
                    ...(isNewResource ? [setNewResource] : [])
                ]
            });
        });
};
