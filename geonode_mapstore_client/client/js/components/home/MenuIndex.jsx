/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import castArray from 'lodash/castArray';
import isNil from 'lodash/isNil';
import ReactResizeDetector from 'react-resize-detector';
import SwipeMenu from '@js/components/home/SwipeMenu';
import Tag from '@js/components/home/Tag';
import { Dropdown, Badge } from 'react-bootstrap-v1';
import Message from '@mapstore/framework/components/I18N/Message';
import {
    readProperty,
    filterMenuItems
} from '@js/utils/MenuUtils';
import { getConfigProp } from '@mapstore/framework/utils/ConfigUtils';

const isValidBadgeValue = value => !!(value !== '' && !isNil(value));

function MenuItem({
    tabIndex,
    draggable,
    item,
    menuItemsProps,
    containerNode
}) {
    const { formatHref, query, state } = menuItemsProps;
    const { type, label, labelId = '', items = [], href, style, badge = '' } = item;
    const badgeValue = readProperty(state, badge);
    if (type === 'dropdown') {
        const dropdownItems = items
            .filter((itm) => filterMenuItems(state, itm, item))
            .map((itm, idx) => {
                if (itm.type === 'divider') {
                    return <Dropdown.Divider key={idx} />;
                }
                const itmBadgeValue = readProperty(state, itm.badge || '');
                return (
                    <Dropdown.Item
                        key={idx}
                        href={readProperty(state, itm.href)}
                        style={itm.style}
                    >
                        {itm.labelId && <Message msgId={itm.labelId}/> || itm.label}
                        {isValidBadgeValue(itmBadgeValue) && <Badge>{itmBadgeValue}</Badge>}
                    </Dropdown.Item>
                );
            });
        return (
            <Dropdown>
                <Dropdown.Toggle
                    id={'gn-menu-index-' + item.id}
                    variant="default"
                    tabIndex={tabIndex}
                    style={style}
                >
                    {labelId && <Message msgId={labelId}/> || label}
                    {isValidBadgeValue(badgeValue) && <Badge>{badgeValue}</Badge>}
                </Dropdown.Toggle>
                {containerNode
                    ? createPortal(<Dropdown.Menu>
                        {dropdownItems}
                    </Dropdown.Menu>, containerNode.parentNode)
                    : <Dropdown.Menu>
                        {dropdownItems}
                    </Dropdown.Menu>}
            </Dropdown>
        );
    }
    if (type === 'link') {
        return (
            <Tag
                tabIndex={tabIndex}
                draggable={draggable}
                href={readProperty(state, href)}
                style={style}
            >
                {labelId && <Message msgId={labelId}/> || label}
                {isValidBadgeValue(badgeValue) && <Badge>{badgeValue}</Badge>}
            </Tag>
        );
    }
    if (type === 'divider') {
        return <div className="gn-menu-index-divider" style={style}></div>;
    }
    if (type === 'filter') {
        const active = castArray(query.f || []).find(value => value === item.id);
        return (
            <Tag
                tabIndex={tabIndex}
                draggable={draggable}
                active={active}
                style={style}
                href={formatHref({
                    query: { f: item.id },
                    replaceQuery: active ? false : true
                })}
            >
                {labelId && <Message msgId={labelId}/> || label}
                {isValidBadgeValue(badgeValue) && <Badge>{badgeValue}</Badge>}
            </Tag>
        );
    }

    return null;
}

const MenuIndex = forwardRef(({
    style,
    leftItems,
    rightItems,
    query,
    formatHref,
    user,
    tools
}, ref) => {

    const state = {
        user,
        ...(getConfigProp('geoNodeResourcesInfo') || {})
    };

    return (
        <nav
            ref={ref}
            className="gn-menu-index"
            style={style}
        >
            <div className="gn-menu-index-container">
                <ReactResizeDetector handleHeight>
                    {({ height }) => (
                        <div
                            className="gn-menu-index-content"
                            style={{ height }}
                        >
                            <SwipeMenu
                                items={leftItems
                                    .filter((item) => filterMenuItems(state, item))}
                                menuItemComponent={MenuItem}
                                menuItemsProps={{
                                    query,
                                    formatHref,
                                    state
                                }}
                            />
                        </div>
                    )}
                </ReactResizeDetector>
                {tools && <div className="gn-menu-index-tools">
                    <ul className="gn-menu-index-right-items">
                        {rightItems
                            .filter((item) => filterMenuItems(state, item))
                            .map((item, idx) => {
                                return (
                                    <li key={idx}>
                                        <MenuItem
                                            item={{ ...item, id: item.id || idx }}
                                            menuItemsProps={{
                                                query,
                                                formatHref,
                                                state
                                            }}
                                        />
                                    </li>
                                );
                            })}
                    </ul>
                    {tools}
                </div>}
            </div>
        </nav>
    );
});

MenuIndex.propTypes = {
    style: PropTypes.object,
    leftItems: PropTypes.array,
    rightItems: PropTypes.array,
    query: PropTypes.object,
    formatHref: PropTypes.func,
    tools: PropTypes.node
};

MenuIndex.defaultProps = {
    leftItems: [],
    rightItems: [],
    query: {},
    formatHref: () => '#'
};

export default MenuIndex;
