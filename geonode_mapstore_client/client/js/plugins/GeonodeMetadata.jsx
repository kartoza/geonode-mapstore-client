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
import Loader from '@mapstore/framework/components/misc/Loader';
import {getResourceId, isNewResource} from "@js/selectors/resource";
import {setControlProperty} from "mapstore/web/client/actions/controls";
import Button from "@js/components/Button";
import Dialog from "../../MapStore2/web/client/components/misc/Dialog";
import {TOGGLE_CONTROL} from "../../MapStore2/web/client/actions/controls";
import {measureSelector} from "../../MapStore2/web/client/selectors/controls";

const METADATA_DIALOG_STYLE = {
    position: 'fixed',
    top: '0%',
    left: '25%'
}
// Api
export const getMetadataBySlugName = () => {
    let currentUrl = window.location.href;
    const mapId = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
    const url = `/maps/${mapId}/metadata_detail/article`;
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
function clearMetadata() {
    return {
        type: 'CLEAR_GEONODE_METADATA'
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
    case 'CLEAR_GEONODE_METADATA': {
        return {
            data: null,
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

export const gnCloseMetadata = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(action => action.control === "metadata" && !measureSelector(store.getState()))
        .switchMap(() => {
            return Observable.of(clearMetadata());
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
        enabled ?
            <Dialog id="metadata-dialog" style={METADATA_DIALOG_STYLE}>
                <div key="header" role="header">
                    <Glyphicon glyph="list-alt"/>&nbsp;<span>Metadata</span>
                    <button key="close" onClick={onClose} className="close"><span>×</span></button>
                </div>
                <div
                    key="body" role="body"
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
            </Dialog> : null
    );
}


GeonodeMetadata.propTypes = {
    resourceId: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
    enabled: PropTypes.bool,
    loading: PropTypes.bool,
    error: PropTypes.string,
    data: PropTypes.string,
    onClose: PropTypes.func,
    onInit: PropTypes.func
};

GeonodeMetadata.defaultProps = {
    resourceId: null,
    enabled: false,
    loading: true,
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
            Metadata
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
        onClick: () => setControlProperty("metadata", "enabled", true)
    }
)((GeonodeMetadataButton));

export default createPlugin('GeonodeMetadata', {
    component: GeonodeMetadataPlugin,
    containers: {
        BurgerMenu: {
            name: 'metadata',
            position: 30,
            text: 'Metadata',
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
        },
        ActionNavbar: {
            name: 'GeonodeMetadata',
            Component: ConnectedGeonodeMetadataButton
        }
    },
    epics: {
        gnGetMetadata,
        gnCloseMetadata
    },
    reducers: {
        gnmetadataresource
    }
});
