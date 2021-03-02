/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import get from 'lodash/get';

function inAllowedGroups(user, allowedGroups) {
    const groups = user?.info?.groups || [];
    return !allowedGroups || !!groups.find(group => allowedGroups.indexOf(group) !== -1);
}

export function readProperty(state, value) {
    if (value?.indexOf('${') === 0) {
        return get(state, value.replace(/^\$\{(.*)\}$/, '$1'));
    }
    return value;
}

export function filterMenuItems(state, item, parent) {
    const isAuthenticated = !parent
        ? item.authenticated
        : parent.authenticated === undefined
            ? item.authenticated
            : parent.authenticated;

    return isAuthenticated === undefined
        || isAuthenticated === true && state?.user && inAllowedGroups(state.user, item.allowedGroups)
        || isAuthenticated === false && !state?.user;
}
