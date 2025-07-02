import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { createPlugin } from "@mapstore/framework/utils/PluginsUtils";
import { connect } from "react-redux";
import {createSelector} from "reselect";
import ResizableModal from "@mapstore/framework/components/misc/ResizableModal";
import gnresource from "@js/reducers/gnresource";
import axios from "../../MapStore2/web/client/libs/ajax";


function IgracGeonodePagePopup({
    resourceData
}) {
    const [data, setData] = useState(resourceData);
    const [open, setOpen] = useState(true);
    const [response, setResponse] = useState({
        retry: 0,
        output: null
    });

    const {pk, resource_type} = data;
    const {retry, output} = response;

    useEffect(() => {
        if ((pk || retry) && retry < 5) {
            axios.get(`/cms/resource/${pk}/${resource_type}/body/`)
                .then(({ data }) => setResponse({output: data, retry: 0 }))
                .catch(({ status }) => {
                    if (status !== 404) {
                        setResponse({...response, retry: retry + 1 });
                    }
                });
        }
    }, [data, retry]);

    useEffect(() => {
        if (JSON.stringify(data) !== JSON.stringify(resourceData)) {
            setResponse({
                retry: 0,
                output: null
            });
            setData(resourceData);
        }
    }, [resourceData]);

    if (!output) {
        return null;
    }

    return (
        <ResizableModal
            modalClassName="gn-igrac-geonode-resource-page-modal"
            size={'lg'}
            show={open}
            fitContent
            enableFooter={false}
            clickOutEnabled={false}
            onClose={() => setOpen(false)}
        >
            <div
                style={{
                    padding: '1rem'
                }}
                dangerouslySetInnerHTML={{ __html: output }}
            />
        </ResizableModal>
    );
}

const resourceDataProps = {
    pk: PropTypes.string,
    resource_type: PropTypes.string
};

IgracGeonodePagePopup.propTypes = {
    resourceData: resourceDataProps,
    onClose: PropTypes.func
};

IgracGeonodePagePopup.defaultProps = {
    resourceData: {
        pk: null,
        resource_type: null
    },
    onClose: () => {}
};

const ResourceGeonodePagePopupPlugin = connect(
    createSelector([
        state => state?.gnresource?.data
    ], (data) => ({
        resourceData: {
            pk: data?.pk,
            resource_type: data?.resource_type
        }
    }))
)(IgracGeonodePagePopup);

export default createPlugin('IgracGeonodePagePopup', {
    component: ResourceGeonodePagePopupPlugin,
    containers: {},
    epics: {},
    reducers: {
        gnresource
    }
});
