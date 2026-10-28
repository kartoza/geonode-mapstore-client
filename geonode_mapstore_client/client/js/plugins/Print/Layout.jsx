/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import { connect } from "react-redux";

import { createPlugin } from "@mapstore/framework/utils/PluginsUtils";
import printReducer from "@mapstore/framework/reducers/print";
import { setPrintParameter } from "@mapstore/framework/actions/print";
import { currentLayouts } from "@mapstore/framework/selectors/print";
import PrintOption from "@mapstore/framework/components/print/PrintOption";
import { Layout } from "@mapstore/framework/plugins/print/index";
import { LandscapeOption } from "@mapstore/framework/plugins/print/Layout";

// "Legend on distinct page" without "Include legend": the legend is always printed
// (below the map), so this option alone switches to the *_2_pages_legend layouts
const TwoPagesOption = connect((state) => ({
    checked: !!state.print?.spec?.twoPages,
    layouts: currentLayouts(state)
}), (dispatch) => ({
    onChange: (checked) => {
        dispatch(setPrintParameter("includeLegend", checked));
        dispatch(setPrintParameter("twoPages", checked));
    }
}))(PrintOption);

const alternatives = [{
    name: "2pages",
    component: TwoPagesOption,
    regex: /2_pages/
}, {
    name: "landscape",
    component: LandscapeOption,
    regex: /landscape/
}];

const PrintLayoutOptions = (props) => <Layout {...props} alternatives={alternatives} />;

/**
 * Replaces the Layout panel of the Print form: sheet size, legend on distinct page
 * and orientation ("Include legend" is removed).
 * @name PrintLayoutOptions
 * @memberof plugins.print
 */
export default createPlugin("PrintLayoutOptions", {
    component: PrintLayoutOptions,
    reducers: { print: printReducer },
    containers: {
        Print: {
            priority: 1,
            target: "layout",
            title: "print.layout"
        }
    }
});
