/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import main from '@mapstore/framework/components/app/main';
import Router, { withRoutes } from '@js/components/app/Router';
import MainLoader from '@js/components/app/MainLoader';
import { connect } from 'react-redux';
import {
    setConfigProp,
    setLocalConfigurationFile,
    getConfigProp
} from '@mapstore/framework/utils/ConfigUtils';
import {
    getSupportedLocales,
    setSupportedLocales
} from '@mapstore/framework/utils/LocaleUtils';
import security from '@mapstore/framework/reducers/security';
import { setRegGeoserverRule } from '@mapstore/framework/utils/LayersUtils';

import Home from '@js/routes/Home';

import gnsearch from '@js/reducers/gnsearch';
import gnresource from '@js/reducers/gnresource';
import gnsearchEpics from '@js/epics/gnsearch';
import gnlocaleEpics from '@js/epics/gnlocale';

import {
    getConfiguration,
    getEndpoints,
    getAccountInfo,
    getResourcesTotalCount
} from '@js/api/geonode/v2';

import axios from '@mapstore/framework/libs/ajax';

// Set X-CSRFToken in axios;
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

// TODO: we should compile .scss as .less file in MapStore
// and add a link tag with the compiled css in the template
// this will ensure more control on override or custom css
import '../../themes/geonode/scss/geonode.scss';

const SearchRoute = connect(() => ({ hideHero: true }))(Home);
const DEFAULT_LOCALE = {};
const ConnectedRouter = connect((state) => ({
    locale: state?.locale || DEFAULT_LOCALE
}))(Router);

const routes = [
    {
        name: 'homepage',
        path: '/',
        component: Home
    },
    {
        name: 'resources',
        path: [
            '/search/',
            '/search/:pk',
            '/search/:ctype/:pk'
        ],
        component: SearchRoute
    }
];

setLocalConfigurationFile('');
setRegGeoserverRule(/\/[\w- ]*geoserver[\w- ]*\/|\/[\w- ]*gs[\w- ]*\//);

const getVersion = () => {
    if (!__DEVTOOLS__) {
        return __GEONODE_PROJECT_CONFIG__.version;
    }
    return 'dev';
};

const pathsNeedVersion = [
    'static/mapstore/',
    'print.json'
];
axios.interceptors.request.use(
    config => {
        if (config.url && pathsNeedVersion.filter(url => config.url.match(url))[0]) {
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

Promise.all([
    getConfiguration('/static/mapstore/configs/localConfig.json'),
    getAccountInfo(),
    getResourcesTotalCount(),
    getEndpoints()
])
    .then(([localConfig, user, resourcesTotalCount]) => {
        const {
            geoNodeConfiguration,
            supportedLocales: defaultSupportedLocales,
            ...config
        } = localConfig;
        const geoNodePageConfig = window.__GEONODE_PAGE_CONFIG__ || {};
        Object.keys(config).forEach((key) => {
            setConfigProp(key, config[key]);
        });
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
        const securityInitialState = user?.info?.access_token
            && {
                security: {
                    user: user,
                    token: user.info.access_token
                }
            };
        // home app entry point
        main({
            appComponent: withRoutes(routes)(ConnectedRouter),
            loaderComponent: MainLoader,
            initialState: {
                defaultState: {
                    ...securityInitialState
                }
            },
            pluginsConfig: localConfig.plugins || [],
            themeCfg: null,
            appReducers: {
                gnsearch,
                gnresource,
                security
            },
            appEpics: {
                ...gnsearchEpics,
                ...gnlocaleEpics
            },
            geoNodeConfiguration
        });
    });
