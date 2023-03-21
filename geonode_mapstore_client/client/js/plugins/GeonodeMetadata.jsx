import React, {useEffect, useRef} from 'react';
import axios from "axios";
import PropTypes from 'prop-types';
import { Observable } from 'rxjs';
import {createPlugin} from "@mapstore/framework/utils/PluginsUtils";
import {Glyphicon, Alert} from "react-bootstrap";
import {toggleControl} from "@mapstore/framework/actions/controls";
import {createSelector} from "reselect";
import {isLoggedIn} from "@mapstore/framework/selectors/security";
import {mapInfoSelector} from "@mapstore/framework/selectors/map";
import {connect} from "react-redux";
import ResizableModal from '@mapstore/framework/components/misc/ResizableModal';
import Loader from '@mapstore/framework/components/misc/Loader';
import {getResourceId, isNewResource} from "@js/selectors/resource";
import {setControlProperty} from "mapstore/web/client/actions/controls";
import Button from "@js/components/Button";

// Api
export const getMetadataBySlugName = () => {
    let currentUrl = window.location.href;
    if (currentUrl.includes('/maps/')) {
        currentUrl = currentUrl.replace('/view', '').replace('/edit', '');
    }
    const url = `${currentUrl.replace('#', '')}/metadata_detail/article`;
    console.log('getMetadataBySlugName');
    return axios.get(url)
        // add pk as alias to id
        // used in save and save as for map
        .then(({ data }) => (data));
};

// Actions
function fetchGeonodeMetadata(id) {
    return {
        type: 'FETCH_GEONODE_METADATA',
        id
    };
}
function setMetadata(data) {
    return {
        type: 'SET_GEONODE_METADATA',
        data
    };
}
function metadataError(error) {
    return {
        type: 'GEONODE_METADATA_ERROR',
        error
    };
}


// Reducers
export function gnmetadataresource(state = {}, action) {
    switch (action.type) {
    case 'FETCH_GEONODE_METADATA': {
        return {
            ...state,
            loading: true
        };
    }
    case 'SET_GEONODE_METADATA': {
        return {
            error: null,
            data: action.data,
            loading: false
        };
    }
    case 'GEONODE_METADATA_ERROR': {
        return {
            data: null,
            error: action.error,
            loading: false
        };
    }
    default:
        return state;
    }
}

// Epics
export const gnGetMetadata = (action$, store) =>
    action$.ofType('FETCH_GEONODE_METADATA')
        .switchMap((action) => {
            return Observable.defer(() => getMetadataBySlugName())
                .switchMap((data) => {
                    return Observable.of(setMetadata(data));
                })
                .catch((error) => {
                    return Observable.of(metadataError(error.data || error.message));
                });
        });

function GeonodeMetadata({
    resourceId,
    enabled,
    loading,
    error,
    data,
    onClose,
    onInit
}) {
    const state = useRef();
    state.current = {
        resourceId,
        data
    };

    useEffect(() => {
        if (enabled && !data) {
            onInit(state.current.resourceId);
        }
    }, [ enabled ]);

    return (
        <ResizableModal
            modalClassName="gn-metadata-modal"
            title="Map Metadata"
            show={enabled}
            size={'lg'}
            fitContent
            enableFooter={false}
            clickOutEnabled={false}
            onClose={() => onClose()}
        >
            <div
                style={{
                    top: 0,
                    left: 0,
                    minHeight: 550,
                    maxHeight: 550,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {error && <Alert bsStyle="danger" style={{ margin: 0 }}>
                    <div>Metadata cannot be fetched</div>
                </Alert>}
                {data && <div style={{
                    overflowY: 'scroll',
                    height: 550,
                    width: '100%',
                    paddingLeft: 20,
                    paddingRight: 20}} dangerouslySetInnerHTML={{ __html: data }}/>}
                {loading && <Loader size={80} />}
            </div>
        </ResizableModal>
    );
}


GeonodeMetadata.propTypes = {
    resourceId: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
    enabled: PropTypes.bool,
    loading: PropTypes.bool,
    error: PropTypes.obj,
    data: PropTypes.string,
    onClose: PropTypes.func,
    onInit: PropTypes.func
};

GeonodeMetadata.defaultProps = {
    resourceId: null,
    enabled: false,
    loading: false,
    error: null,
    data: '',
    onClose: () => {},
    onInit: () => {}
};

const GeonodeMetadataPlugin = connect(
    createSelector([
        state => state?.controls?.metadata?.enabled,
        mapInfoSelector,
        state => state?.gnmetadataresource?.data,
        state => state?.gnmetadataresource?.loading,
        state => state?.gnmetadataresource?.error
    ], (enabled, mapInfo, data, loading, error) => ({
        enabled,
        resourceId: mapInfo?.id,
        data,
        loading,
        error
    })),
    {
        onClose: toggleControl.bind(null, 'metadata', null),
        onInit: fetchGeonodeMetadata
    }
)(GeonodeMetadata);

function GeonodeMetadataButton({
    enabled,
    variant,
    onClick,
    size
}) {
    return enabled
        ? <Button
            variant={variant || "primary"}
            size={size}
            onClick={() => onClick()}
        >
            Geonode Metadata
        </Button>
        : null
    ;
}

const ConnectedGeonodeMetadataButton = connect(
    createSelector(
        isNewResource,
        getResourceId,
        mapInfoSelector,
        (isNew, resourceId, mapInfo) => ({
            enabled: !isNew && (resourceId || mapInfo?.id)
        })
    ),
    {
        onClick: setControlProperty.bind(null, 'rightOverlay', 'enabled', 'Metadata')
    }
)((GeonodeMetadataButton));

export default createPlugin('GeonodeMetadata', {
    component: GeonodeMetadataPlugin,
    containers: {
        ActionNavbar: {
            name: 'GeonodeMetadata',
            Component: ConnectedGeonodeMetadataButton
        }
    },
    epics: {
        gnGetMetadata
    },
    reducers: {
        gnmetadataresource
    }
});
