/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import { createPlugin } from "@mapstore/framework/utils/PluginsUtils";
import printReducer from "@mapstore/framework/reducers/print";
import { Layout } from "@mapstore/framework/plugins/print/index";
import { LandscapeOption } from "@mapstore/framework/plugins/print/Layout";

// only the orientation option: the legend is always printed below the map,
// so "Include legend" and "Legend on distinct page" are removed
const alternatives = [{
    name: "landscape",
    component: LandscapeOption,
    regex: /landscape/
}];

const PrintLayoutOptions = (props) => <Layout {...props} alternatives={alternatives} />;

/**
 * Replaces the Layout panel of the Print form, keeping the sheet size and orientation only.
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
