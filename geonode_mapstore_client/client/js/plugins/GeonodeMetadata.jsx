import React, {useEffect, useRef} from 'react';
import axios from "axios";
import PropTypes from 'prop-types';
import { Observable } from 'rxjs';
import {createPlugin} from "../../MapStore2/web/client/utils/PluginsUtils";
import {Glyphicon, Alert} from "react-bootstrap";
import {toggleControl} from "../../MapStore2/web/client/actions/controls";
import {createSelector} from "reselect";
import {isLoggedIn} from "../../MapStore2/web/client/selectors/security";
import {mapInfoSelector} from "../../MapStore2/web/client/selectors/map";
import {connect} from "react-redux";
import ResizableModal
    from "../../MapStore2/web/client/components/misc/ResizableModal";
import Loader from "../../MapStore2/web/client/components/misc/Loader";

// Api
export const getMetadataBySlugName = () => {
    let currentUrl = window.location.href;
    if (currentUrl.includes('/maps/')) {
        currentUrl = currentUrl.replace('/view', '').replace('/edit', '');
    }
    const url = `${currentUrl.replace('#', '')}/metadata_detail/article`;
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

export default createPlugin('GeonodeMetadata', {
    component: GeonodeMetadataPlugin,
    containers: {
        BurgerMenu: {
            name: 'geonode-metadata',
            position: 30,
            text: 'Map Metadata',
            icon: <Glyphicon glyph="list-alt"/>,
            action: toggleControl.bind(null, 'metadata', null),
            // display the BurgerMenu button only if page is in the view mode
            selector: createSelector(
                isLoggedIn,
                mapInfoSelector,
                (loggedIn, {canEdit, id} = {}) => ({
                    style: window.location.href.includes('/view/') || window.location.href.includes('/maps/') && id ? {} : { display: 'none'} // the resource is new (no resource) or if present, is editable
                })
            )
        }
    },
    epics: {
        gnGetMetadata
    },
    reducers: {
        gnmetadataresource
    }
});
