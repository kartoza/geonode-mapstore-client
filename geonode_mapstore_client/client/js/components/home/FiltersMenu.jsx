/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import { Dropdown, Button } from 'react-bootstrap-v1';
import ReactResizeDetector from 'react-resize-detector';
import SwipeMenu from '@js/components/home/SwipeMenu';
import Message from '@mapstore/framework/components/I18N/Message';
import Tag from '@js/components/home/Tag';
import { getFilterLabelById } from '@js/utils/GNSearchUtils';

function MenuItem({
    tabIndex,
    draggable,
    item,
    menuItemsProps
}) {
    const { formatHref } = menuItemsProps;
    return (
        <Tag
            active
            tabIndex={tabIndex}
            draggable={draggable}
            showTimesIcon
            href={formatHref({
                query: { [item.key]: item.value }
            })}
        >
            {getFilterLabelById(item.key, item.value) || item.value}
        </Tag>
    );
}

const FiltersMenu = forwardRef(({
    formatHref,
    orderOptions,
    order,
    filters,
    style,
    onClear,
    defaultLabelId
}, ref) => {

    const selectedSort = orderOptions.find(({ value }) => order === value);
    return (
        <div
            className="gn-filters-menu"
            style={style}
            ref={ref}
        >
            <div className="gn-filters-menu-container">
                {filters?.length > 0
                    && <Button
                        variant="default"
                        size="sm"
                        onClick={() => onClear()}
                    >
                        <Message msgId="gnhome.clearFilters"/>
                    </Button>}
                <ReactResizeDetector handleHeight>
                    {({ height }) => (
                        <div
                            className="gn-filters-menu-content"
                            style={{ height }}
                        >
                            <SwipeMenu
                                items={filters}
                                menuItemComponent={MenuItem}
                                menuItemsProps={{
                                    formatHref
                                }}
                            />
                        </div>
                    )}
                </ReactResizeDetector>
                <div
                    className="gn-filters-menu-tools"
                >
                    {orderOptions.length > 0 && <Dropdown alignRight>
                        <Dropdown.Toggle
                            id="sort-dropdown"
                            variant="default"
                            size="sm"
                        >
                            <Message msgId={selectedSort?.labelId || defaultLabelId} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {orderOptions.map(({ labelId, value }) => {
                                return (
                                    <Dropdown.Item
                                        key={value}
                                        active={value === selectedSort?.value}
                                        href={formatHref({
                                            query: {
                                                sort: [value]
                                            },
                                            replaceQuery: true
                                        })}
                                    >
                                        <Message msgId={labelId} />
                                    </Dropdown.Item>
                                );
                            })}
                        </Dropdown.Menu>
                    </Dropdown>}
                </div>
            </div>
        </div>
    );
});

FiltersMenu.defaultProps = {
    orderOptions: [
        {
            label: 'Most recent',
            labelId: 'gnhome.mostRecent',
            value: '-date'
        },
        {
            label: 'Less recent',
            labelId: 'gnhome.lessRecent',
            value: 'date'
        },
        {
            label: 'A Z',
            labelId: 'gnhome.aZ',
            value: 'title'
        },
        {
            label: 'Z A',
            labelId: 'gnhome.zA',
            value: '-title'
        },
        {
            label: 'Most popular',
            labelId: 'gnhome.mostPopular',
            value: 'popular_count'
        }
    ],
    defaultLabelId: 'gnhome.orderBy',
    formatHref: () => '#',
    onClear: () => {}
};

export default FiltersMenu;
