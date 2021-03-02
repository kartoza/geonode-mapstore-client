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
import { getConfigProp, setConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import { configureMap } from '@mapstore/framework/actions/config';
import { loadPrintCapabilities } from '@mapstore/framework/actions/print';
import { setControlProperty } from '@mapstore/framework/actions/controls';
import controls from '@mapstore/framework/reducers/controls';
import maptype from '@mapstore/framework/reducers/maptype';
import security from '@mapstore/framework/reducers/security';
import print from '@mapstore/framework/reducers/print';
import {
    standardReducers,
    standardEpics,
    standardRootReducerFunc
} from '@mapstore/framework/stores/defaultOptions';

import MapView from '@js/routes/MapView';

import gnresource from '@js/reducers/gnresource';
import gnlocaleEpics from '@js/epics/gnlocale';

import { getConfiguration } from '@js/api/geonode/v2';

import isArray from 'lodash/isArray';

import {
    setupConfiguration,
    getVersion,
    initializeApp
} from '@js/utils/AppUtils';


import {
    updateMapLayoutEpic
} from '@js/epics';
import maplayout from '@mapstore/framework/reducers/maplayout';
import 'react-widgets/dist/css/react-widgets.css';
import 'react-select/dist/react-select.css';

const DEFAULT_LOCALE = {};
const ConnectedRouter = connect((state) => ({
    locale: state?.locale || DEFAULT_LOCALE
}))(Router);

const routes = [
    {
        name: 'map-viewer',
        path: '/',
        component: MapView
    }
];

initializeApp();

Promise.all([ getConfiguration('/static/mapstore/configs/localConfig.json') ])
    .then(([localConfig, user]) => {

        const {
            securityState,
            geoNodeConfiguration,
            pluginsConfigKey,
            geoNodePageConfig,
            query
        } = setupConfiguration({
            localConfig,
            user
        });

        // get the correct map layout
        const mapLayout = getConfigProp('mapLayout') || {};
        setConfigProp('mapLayout', mapLayout[query.theme] || mapLayout.viewer);

        main({
            appComponent: withRoutes(routes)(ConnectedRouter),
            loaderComponent: MainLoader,
            initialState: {
                defaultState: {
                    ...securityState,
                    maptype: {
                        mapType: 'openlayers'
                    }
                }
            },
            pluginsConfig: isArray(localConfig.plugins)
                ? localConfig.plugins
                : localConfig.plugins
                    ? localConfig.plugins[pluginsConfigKey] || localConfig.plugins
                    : [],
            themeCfg: {
                path: '/static/mapstore/dist/themes',
                prefixContainer: '#container',
                version: getVersion(),
                prefix: 'msgapi',
                theme: query.theme
            },
            printEnabled: true,
            rootReducerFunc: standardRootReducerFunc,
            appReducers: {
                ...standardReducers,
                gnresource,
                security,
                maptype,
                print,
                maplayout,
                controls
            },
            appEpics: {
                ...standardEpics,
                ...gnlocaleEpics,
                updateMapLayoutEpic
            },
            geoNodeConfiguration,
            initialActions: [
                setControlProperty.bind(null, 'toolbar', 'expanded', false),
                loadPrintCapabilities.bind(null, getConfigProp('printUrl')),
                configureMap.bind(
                    null,
                    geoNodePageConfig.resourceConfig,
                    1,
                    true
                )
            ]
        });
    });
