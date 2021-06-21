import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import assign from 'object-assign';
import Rx from 'rxjs';
import {createPlugin} from "../../MapStore2/web/client/utils/PluginsUtils";
import {isLoggedIn} from "../../MapStore2/web/client/selectors/security";
import {mapInfoSelector} from "../../MapStore2/web/client/selectors/map";
import {connect} from "react-redux";
import {createSelector} from "reselect";
import {Alert} from "react-bootstrap";
import ResizableModal
    from "../../MapStore2/web/client/components/misc/ResizableModal";
import Loader from "../../MapStore2/web/client/components/misc/Loader";
import {
    DOWNLOAD_IGRAC_DATA, FINISH_DOWNLOADING_IGRAC_DATA
} from "../../MapStore2/web/client/actions/featuregrid";
import {
    getAttributeFilters
} from "../../MapStore2/web/client/selectors/featuregrid";
import featuregrid from "../../MapStore2/web/client/reducers/featuregrid";
import axios from "../../MapStore2/web/client/libs/ajax";
const IGRAC_DOWNLOAD_URL = '/groundwater/record/download/';

const downloadProgressHtml = (taskId) => (
    '<div>' +
    '<h1>Download has been started</h1> <hr> ' +
    '<p> Please check this page to see the progress of the download : <br/><a target="_blank" href="https://staging.igrac.kartoza.com/groundwater/download?task_id=' + taskId + '">' +
    'https://staging.igrac.kartoza.com/groundwater/download?task_id=' + taskId + '</a></p>' +
    '</div>'
);

const downloadErrorHtml = (
    '<div>' +
    '<h1>Download Error</h1> <hr> ' +
    '<p> Please sign in first before downloading the data' +
    '</div>'
);

// Actions
export const finishDownloadingIGRACData = (taskId) => {
    return {
        type: FINISH_DOWNLOADING_IGRAC_DATA,
        taskId
    };
};

export const errorDownloadingIGRACData = () => {
    return {
        type: 'IGRAC_DOWNLOAD_ERROR'
    };
};

export const downloadIGRACData = () => {
    return {
        type: DOWNLOAD_IGRAC_DATA
    };
};

export const closeDownloadModal = () => {
    return {
        type: 'CLOSE_DOWNLOAD_MODAL'
    };
};

// Epics
export const startDownloadingIGRACData = (action$, { getState } = {}) =>
    action$
        .ofType(DOWNLOAD_IGRAC_DATA)
        .switchMap(() => {
            if (isLoggedIn(getState())) {
                const attributesFilter = getAttributeFilters(getState()) || {};
                return Rx.Observable.fromPromise(
                    axios.post(IGRAC_DOWNLOAD_URL, attributesFilter).then( response => response.data.task_id )
                ).switchMap(
                    (taskId) => Rx.Observable.of(finishDownloadingIGRACData(taskId))
                );
            }
            return Rx.Observable.of(finishDownloadingIGRACData(), errorDownloadingIGRACData());
        });

// Reducers
export function igracDownloadReducers(state = {}, action) {
    switch (action.type) {
    case DOWNLOAD_IGRAC_DATA: {
        return assign({}, state.featuregrid, {
            isIGRACDownloading: true
        });
    }
    case FINISH_DOWNLOADING_IGRAC_DATA: {
        return assign({}, state, {
            isIGRACDownloading: false,
            data: downloadProgressHtml(action.taskId),
            enabled: true
        });
    }
    case 'CLOSE_DOWNLOAD_MODAL': {
        return assign({}, state, {
            isIGRACDownloading: false,
            data: '',
            enabled: false
        });
    }
    case 'IGRAC_DOWNLOAD_ERROR': {
        return assign({}, state, {
            data: downloadErrorHtml,
            enabled: true
        });
    }
    default:
        return state;
    }
}

function IgracDownload({
    resourceId,
    enabled,
    downloading,
    error,
    data,
    onClose
}) {
    const state = useRef();
    state.current = {
        resourceId,
        data
    };

    return (
        <ResizableModal
            modalClassName="gn-igrac-download-modal"
            title="IGRAC Download"
            show={enabled}
            size={'s'}
            fitContent
            enableFooter={false}
            clickOutEnabled={false}
            onClose={() => onClose()}
        >
            <div
                style={{
                    top: 0,
                    left: 0,
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
                    <div>Data cannot be fetched</div>
                </Alert>}
                {data && <div style={{
                    width: '100%',
                    height: 200,
                    paddingLeft: 20,
                    paddingRight: 20}} dangerouslySetInnerHTML={{ __html: data }}/>}
            </div>
        </ResizableModal>
    );
}

IgracDownload.propTypes = {
    resourceId: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
    enabled: PropTypes.bool,
    downloading: PropTypes.bool,
    error: PropTypes.obj,
    data: PropTypes.string,
    onClose: PropTypes.func,
    onInit: PropTypes.func
};

IgracDownload.defaultProps = {
    resourceId: null,
    enabled: false,
    downloading: false,
    error: null,
    data: '',
    onClose: () => {},
    onInit: () => {}
};

const IgracDownloadPlugin = connect(
    createSelector([
        state => state?.igracDownloadReducers?.enabled,
        mapInfoSelector,
        state => state?.igracDownloadReducers?.data,
        state => state?.igracDownloadReducers?.isIGRACDownloading,
        state => state?.igracDownloadReducers?.error
    ], (enabled, mapInfo, data, downloading, error) => ({
        enabled,
        resourceId: mapInfo?.id,
        data,
        downloading,
        error
    })),
    {
        onClose: closeDownloadModal.bind(null)
    }
)(IgracDownload);

export default createPlugin('IgracDownload', {
    component: IgracDownloadPlugin,
    containers: {},
    epics: {
        startDownloadingIGRACData
    },
    reducers: {
        igracDownloadReducers,
        featuregrid
    }
});
