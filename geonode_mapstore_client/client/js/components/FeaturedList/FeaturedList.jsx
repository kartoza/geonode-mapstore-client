/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import Button from '@js/components/Button';
import Spinner from '@js/components/Spinner';
import HTML from '@mapstore/framework/components/I18N/HTML';
import FaIcon from '@js/components/FaIcon';
import { withResizeDetector } from 'react-resize-detector';
import { actionButtons } from '@js/utils/ResourceServiceUtils';
import Cards from './Cards';

const FeaturedList = withResizeDetector(({
    resources,
    loading,
    isNextPageAvailable,
    formatHref,
    isCardActive,
    containerStyle,
    header,
    cardOptions,
    buildHrefByTemplate,
    isPreviousPageAvailable,
    loadFeaturedResources,
    onLoad,
    width,
    onControl,
    onAction,
    onDownload,
    downloading
}) => {

    const [count, setCount] = useState();

    const nextIconStyles = {
        fontSize: '1rem',
        ...(!isNextPageAvailable || loading ? {color: 'grey', cursor: 'not-allowed'} : {cursor: 'pointer'})
    };

    const previousIconStyles = {
        fontSize: '1rem',
        ...(!isPreviousPageAvailable || loading ? { color: 'grey', cursor: 'not-allowed' } : { cursor: 'pointer' })
    };

    return (
        <div className="gn-card-grid" style={resources.length === 0 ? { display: 'none' } : {}}>
            {header}
            <div style={{
                display: 'flex', width: '100%', height: '100%'
            }}>
                <div style={{ flex: 1, width: '100%', height: '100%', paddingBottom: '50px' }}>
                    <div className="gn-card-grid-container" style={containerStyle}>
                        <h1 className="explore-viewer-title">Featured</h1>
                        <Cards
                            featured
                            resources={resources}
                            formatHref={formatHref}
                            isCardActive={isCardActive}
                            options={cardOptions}
                            buildHrefByTemplate={buildHrefByTemplate}
                            containerWidth={width}
                            onResize={(cardsCount) => {
                                !isNaN(cardsCount) && onLoad(undefined, cardsCount);
                                setCount(cardsCount);
                            }}
                            actions={actionButtons}
                            onAction={(action, payload) => {
                                if (action.isControlled) {
                                    onControl(action.processType, 'value', payload);
                                } else {
                                    onAction(action.processType, payload, action.redirectTo);
                                }
                            }}
                            onDownload={onDownload}
                            downloading={downloading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

FeaturedList.defaultProps = {
    page: 1,
    resources: [],
    isNextPageAvailable: false,
    loading: false,
    formatHref: () => '#',
    isCardActive: () => false,
    isPreviousPageAvailable: false,
    onLoad: () => { }
};

export default FeaturedList;
