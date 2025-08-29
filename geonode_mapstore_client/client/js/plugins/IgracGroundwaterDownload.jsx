import React from 'react';
import { createPlugin } from "@mapstore/framework/utils/PluginsUtils";
import { createSelector } from "reselect";
import { connect } from "react-redux";
import gnresource from "@js/reducers/gnresource";
import Button from "@js/components/Button";

function IgracGroundwaterDownload({}) {
    return null;
}

const IgracGroundwaterDownloadPlugin = connect(
    createSelector([
        state => state?.gnresource?.data
    ], (data) => ({
        gnresourceData: data
    }))
)(IgracGroundwaterDownload);

function IgracGroundwaterDownloadButton(
    {
        gnresourceData,
        variant,
        size
    }
) {
    let show = false;

    if (gnresourceData?.alternate?.includes('groundwater:')) {
        show = true;
    } else {
        show = !!(
            gnresourceData?.maplayers?.find(layer => layer.current_style?.includes('groundwater:'))
        );
    }

    if (!show) {
        return null;
    }


    return (
        <a href="/groundwater/record/download" target="_blank">
            <Button
                variant={variant || "primary"}
                size={size}
            >
                Data download
            </Button>
        </a>
    );
}

const ConnectedIgracGroundwaterDownloadButton = connect(
    createSelector([
        state => state?.gnresource?.data
    ], (data) => {
        return {
            gnresourceData: data
        };
    })
)((IgracGroundwaterDownloadButton));

export default createPlugin('IgracGroundwaterDownload', {
    component: IgracGroundwaterDownloadPlugin,
    containers: {
        ActionNavbar: {
            name: 'IgracGroundwaterDownload',
            Component: ConnectedIgracGroundwaterDownloadButton
        }
    },
    epics: {},
    reducers: {
        gnresource
    }
});
