/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from "rxjs";
import get from "lodash/get";

import { createPlugin } from "@mapstore/framework/utils/PluginsUtils";
import { TOGGLE_CONTROL, SET_CONTROL_PROPERTY } from "@mapstore/framework/actions/controls";
import { setPrintParameter } from "@mapstore/framework/actions/print";
import printReducer from "@mapstore/framework/reducers/print";
import { getResourceData } from "@js/selectors/resource";

const MAX_DESCRIPTION_LENGTH = 300;

const isPrintOpen = (state) =>
    !!(get(state, "controls.print.enabled") || get(state, "controls.toolbar.active") === "print");

const htmlToText = (html = "") => {
    if (!html) {
        return "";
    }
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

const truncate = (text, max) =>
    max > 0 && text.length > max ? `${text.slice(0, max).trim()}…` : text;

export const getPrintResourceInfo = (resource) => ({
    title: resource?.title || "",
    description: truncate(
        resource?.raw_abstract
            ? resource.raw_abstract.replace(/\s+/g, " ").trim()
            : htmlToText(resource?.abstract),
        MAX_DESCRIPTION_LENGTH
    )
});

// fill the form only once per resource, so the user edits are kept
// when the print panel is closed and opened again
let lastFilledResource = null;

export const gnPrintFillResourceInfo = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL, SET_CONTROL_PROPERTY)
        .filter(({ control }) => control === "print" || control === "toolbar")
        .filter(() => isPrintOpen(store.getState()))
        .switchMap(() => {
            const resource = getResourceData(store.getState());
            const key = resource ? `${resource.resource_type}:${resource.pk}` : null;
            if (!resource || key === lastFilledResource) {
                return Rx.Observable.empty();
            }
            lastFilledResource = key;
            const { title, description } = getPrintResourceInfo(resource);
            return Rx.Observable.of(
                setPrintParameter("name", title),
                setPrintParameter("description", description)
            );
        });

/**
 * Plugin without UI that fills the Title and Description of the Print form
 * with the title and abstract of the current resource (dataset or map).
 * @name PrintResourceInfo
 * @memberof plugins.print
 */
export default createPlugin("PrintResourceInfo", {
    component: () => null,
    reducers: { print: printReducer },
    epics: { gnPrintFillResourceInfo }
});
