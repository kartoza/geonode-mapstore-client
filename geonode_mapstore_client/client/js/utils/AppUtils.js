/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    setConfigProp,
    getConfigProp,
    setLocalConfigurationFile
} from '@mapstore/framework/utils/ConfigUtils';
import {
    getSupportedLocales,
    setSupportedLocales
} from '@mapstore/framework/utils/LocaleUtils';
import { setRegGeoserverRule } from '@mapstore/framework/utils/LayersUtils';

import url from 'url';
import axios from '@mapstore/framework/libs/ajax';

export function getVersion() {
    if (!__DEVTOOLS__) {
        return __GEONODE_PROJECT_CONFIG__.version;
    }
    return 'dev';
}

export function initializeApp() {

    // Set X-CSRFToken in axios;
    axios.defaults.xsrfHeaderName = "X-CSRFToken";
    axios.defaults.xsrfCookieName = "csrftoken";

    setLocalConfigurationFile('');
    setRegGeoserverRule(/\/[\w- ]*geoserver[\w- ]*\/|\/[\w- ]*gs[\w- ]*\//);
    const pathsNeedVersion = [
        'static/mapstore/',
        'print.json'
    ];
    axios.interceptors.request.use(
        config => {
            if (config.url && pathsNeedVersion.filter(pathNeedVersion => config.url.match(pathNeedVersion))[0]) {
                return {
                    ...config,
                    params: {
                        ...config.params,
                        v: getVersion()
                    }
                };
            }
            return config;
        }
    );
}

export function setupConfiguration({
    localConfig,
    user,
    resourcesTotalCount
}) {
    const { query } = url.parse(window.location.href, true);
    const {
        geoNodeConfiguration,
        supportedLocales: defaultSupportedLocales,
        ...config
    } = localConfig;
    const geoNodePageConfig = window.__GEONODE_PAGE_CONFIG__ || {};

    Object.keys(config).forEach((key) => {
        setConfigProp(key, config[key]);
    });
    // overrides from django template
    if (geoNodePageConfig.localConfig) {
        Object.keys(geoNodePageConfig.localConfig).forEach((key) => {
            setConfigProp(key, geoNodePageConfig.localConfig[key]);
        });
    }
    setConfigProp('translationsPath', config.translationsPath
        ? config.translationsPath
        : __GEONODE_PROJECT_CONFIG__.translationsPath
    );
    const supportedLocales = defaultSupportedLocales || getSupportedLocales();
    setSupportedLocales(supportedLocales);
    const locale = supportedLocales[geoNodePageConfig.languageCode]?.code;
    setConfigProp('locale', locale);
    const menuFilters = geoNodeConfiguration?.menu?.items?.filter(({ type }) => type === 'filter');
    setConfigProp('menuFilters', menuFilters);
    const geoNodeResourcesInfo = getConfigProp('geoNodeResourcesInfo') || {};
    setConfigProp('geoNodeResourcesInfo', { ...geoNodeResourcesInfo, ...resourcesTotalCount });
    const securityState = user?.info?.access_token
        && {
            security: {
                user: user,
                token: user.info.access_token
            }
        };

    return {
        query,
        securityState,
        geoNodeConfiguration,
        geoNodePageConfig,
        pluginsConfigKey: query.config || geoNodePageConfig.pluginsConfigKey
    };
}
