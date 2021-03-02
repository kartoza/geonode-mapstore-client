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
import BorderLayout from '@mapstore/framework/components/layout/BorderLayout';
import { getMonitoredState } from '@mapstore/framework/utils/PluginsUtils';
import { getConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import { updateUrlOnScroll } from '@mapstore/framework/actions/geostory';
import PluginsContainer from '@mapstore/framework/components/plugins/PluginsContainer';

import useLazyPlugins from '@js/hooks/useLazyPlugins';
import pluginsEntries from '@js/plugins/index';

const urlQuery = url.parse(window.location.href, true).query;

const ConnectedPluginsContainer = connect((state) => ({
    mode: urlQuery.mode || (urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
    monitoredState: getMonitoredState(state, getConfigProp('monitorState'))
}))(PluginsContainer);

function GeoStoryRoute({
    pluginsConfig,
    params,
    onMount,
    loaderComponent
}) {
    const [loading, setLoading] = useState(true);
    const { plugins } = useLazyPlugins({
        pluginsEntries,
        pluginsConfig: pluginsConfig || getConfigProp('plugins')
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
                key="page-geostory"
                id="page-geostory"
                className="page page-geostory"
                component={BorderLayout}
                pluginsConfig={pluginsConfig || getConfigProp('plugins')}
                plugins={plugins}
                params={params}
                onPluginsLoaded={() => setLoading(false)}
            />
            {loading && Loader && <Loader />}
        </>
    );
}

GeoStoryRoute.propTypes = {
    onMount: PropTypes.func
};

const ConnectedGeoStoryRoute = connect(
    () => ({}),
    {
        onMount: updateUrlOnScroll
    }
)(GeoStoryRoute);

ConnectedGeoStoryRoute.displayName = 'ConnectedGeoStoryRoute';

export default ConnectedGeoStoryRoute;


