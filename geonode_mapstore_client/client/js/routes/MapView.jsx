/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import url from 'url';
import isArray from 'lodash/isArray';
import BorderLayout from '@mapstore/framework/components/layout/BorderLayout';
import { getMonitoredState } from '@mapstore/framework/utils/PluginsUtils';
import { getConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import PluginsContainer from '@mapstore/framework/components/plugins/PluginsContainer';

import useLazyPlugins from '@js/hooks/useLazyPlugins';
import pluginsEntries from '@js/plugins/index';

import ReactSwipe from 'react-swipeable-views';
import SwipeHeader from '@mapstore/framework/components/data/identify/SwipeHeader';
const requires = {
    ReactSwipe,
    SwipeHeader
};

const urlQuery = url.parse(window.location.href, true).query;

const ConnectedPluginsContainer = connect((state) => ({
    mode: urlQuery.mode || (urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
    monitoredState: getMonitoredState(state, getConfigProp('monitorState')),
    pluginsState: {
        ...state.controls
    }
}))(PluginsContainer);

function MapViewerRoute({
    name,
    pluginsConfig: propPluginsConfig,
    params,
    onMount,
    loaderComponent
}) {
    const pluginsConfig = isArray(propPluginsConfig)
        ? propPluginsConfig
        : propPluginsConfig && propPluginsConfig[name] || [];

    const [loading, setLoading] = useState(true);
    const { plugins } = useLazyPlugins({
        pluginsEntries,
        pluginsConfig
    });
    useEffect(() => {
        if (!loading && onMount) {
            onMount(true);
        }
    }, [ loading, onMount ]);
    const Loader = loaderComponent;
    return (
        <>
            <ConnectedPluginsContainer
                key="page-map-viewer"
                id="page-map-viewer"
                className="page page-map-viewer"
                component={BorderLayout}
                pluginsConfig={pluginsConfig}
                plugins={{ ...plugins, requires }}
                params={params}
                onPluginsLoaded={() => setLoading(false)}
            />
            {loading && Loader && <Loader />}
        </>
    );
}

MapViewerRoute.propTypes = {
    onMount: PropTypes.func
};

const ConnectedMapViewerRoute = connect(
    () => ({}),
    {}
)(MapViewerRoute);

ConnectedMapViewerRoute.displayName = 'ConnectedMapViewerRoute';

export default ConnectedMapViewerRoute;


