import React, { useEffect, useState } from 'react';
import axios from "axios";
import { createPlugin } from "@mapstore/framework/utils/PluginsUtils";
import { createSelector } from "reselect";
import { connect } from "react-redux";
import ResizableModal
    from "../../MapStore2/web/client/components/misc/ResizableModal";
import gnresource from "@js/reducers/gnresource";
import Button from "@js/components/Button";
import Message from "../../MapStore2/web/client/components/I18N/Message";

function IgracGroundwaterContributor({}) {
    return null;
}

const IgracGroundwaterContributorPlugin = connect(
    createSelector([
        state => state?.gnresource?.data
    ], (data) => ({
        resourceData: {
            pk: data?.pk,
            resource_type: data?.resource_type
        }
    }))
)(IgracGroundwaterContributor);

function IgracGroundwaterContributorButton(
    {
        resourceData,
        variant,
        size
    }
) {
    const [data, setData] = useState(resourceData);
    const [open, setOpen] = useState(false);
    const [response, setResponse] = useState({
        retry: 0,
        output: null
    });

    const { pk, resource_type } = data;
    const { retry, output } = response;

    useEffect(() => {
        if ((pk || retry) && retry < 5) {
            axios.get(`/contributors/resource/${pk}/${resource_type}/`)
                .then(({ data }) => setResponse({ output: data, retry: 0 }))
                .catch(({ status }) => {
                    if (status !== 404) {
                        setResponse({ ...response, retry: retry + 1 });
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
        <>
            <Button
                variant={variant || "primary"}
                size={size}
                onClick={() => setOpen(true)}
            >
                Contributors
            </Button>
            <ResizableModal
                title={'Contributors'}
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
        </>
    );
}

const ConnectedIgracGroundwaterContributorButton = connect(
    createSelector([
        state => state?.gnresource?.data
    ], (data) => ({
        resourceData: {
            pk: data?.pk,
            resource_type: data?.resource_type
        }
    }))
)((IgracGroundwaterContributorButton));

export default createPlugin('IgracGroundwaterContributor', {
    component: IgracGroundwaterContributorPlugin,
    containers: {
        ActionNavbar: {
            name: 'IgracGroundwaterContributor',
            Component: ConnectedIgracGroundwaterContributorButton
        }
    },
    epics: {},
    reducers: {
        gnresource
    }
});
