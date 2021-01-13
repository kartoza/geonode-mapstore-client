/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import { Card, Dropdown } from 'react-bootstrap-v1';
import Message from '@mapstore/framework/components/I18N/Message';
import FaIcon from '@js/components/home/FaIcon';
import Tag from '@js/components/home/Tag';
import {
    getUserName,
    getResourceTypesInfo
} from '@js/utils/GNSearchUtils';

const ResourceCard = forwardRef(({
    data,
    active,
    links,
    formatHref,
    getTypesInfo
}, ref) => {

    const res = data;
    const types = getTypesInfo();
    const { icon } = types[res.doc_type] || types[res.resource_type] || {};
    return (
        <Card
            ref={ref}
            className={`gn-resource-card${active ? ' active' : ''}`}
        >
            <a
                className="gn-resource-card-link"
                href={formatHref({
                    pathname: `/search/${res.resource_type}/${res.pk}`
                })}
            />
            <Card.Img
                variant="top"
                src={res.thumbnail_url}
            />
            <Card.Body>
                <Card.Title>
                    {icon &&
                        <>
                            <Tag
                                href={formatHref({
                                    query: {
                                        'filter{resource_type.in}': res.resource_type
                                    }
                                })}>
                                <FaIcon name={icon} />
                            </Tag>
                        </>}
                    <a href={res.detail_url}>
                        {res.title}
                    </a>
                </Card.Title>
                <Card.Text
                    className="gn-card-description"
                >
                    {res.abstract ? res.abstract : '...'}
                </Card.Text>
                <Card.Text
                    lassName="gn-card-user"
                >
                    <Message msgId="gnhome.author"/>: <a href={formatHref({
                        query: {
                            'filter{owner.username.in}': res.owner.username
                        }
                    })}>{getUserName(res.owner)}</a>
                </Card.Text>
                {links && links.length > 0 && <Dropdown
                    className="gn-card-options"
                    alignRight
                >
                    <Dropdown.Toggle
                        id={`gn-card-options-${res.pk}`}
                        variant="default"
                        size="sm"
                    >
                        <FaIcon name="ellipsis-v" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {links.map(({ label, href }) => {
                            return (
                                <Dropdown.Item
                                    key={href}
                                    href={href}
                                >
                                    {label}
                                </Dropdown.Item>
                            );
                        })}
                    </Dropdown.Menu>
                </Dropdown>}
            </Card.Body>
        </Card>
    );
});

ResourceCard.defaultProps = {
    links: [],
    theme: 'light',
    getTypesInfo: getResourceTypesInfo
};

export default ResourceCard;
