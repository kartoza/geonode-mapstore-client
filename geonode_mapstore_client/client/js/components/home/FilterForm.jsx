/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useRef } from 'react';
import castArray from 'lodash/castArray';
import { Form, Col, Button } from 'react-bootstrap-v1';
import ReactSelect from 'react-select';
import Message from '@mapstore/framework/components/I18N/Message';
import localizedProps from '@mapstore/framework/components/misc/enhancers/localizedProps';
import FaIcon from '@js/components/home/FaIcon';
import FilterByExtent from '@js/components/home/FilterByExtent';
import { getFilterLabelById } from '@js/utils/GNSearchUtils';

const SelectSync = localizedProps('placeholder')(ReactSelect);
const SelectAsync = localizedProps('placeholder')(ReactSelect.Async);

function FilterForm({
    id,
    show,
    style,
    query,
    fields,
    onChange,
    onClose,
    extentProps,
    suggestionsRequestTypes
}) {

    const [values, setValues] = useState({});
    const leftColumnNode = useRef();
    const state = useRef({});
    state.current = {
        query,
        fields,
        values
    };

    useEffect(() => {
        const newValues = state.current.fields.reduce((acc, { id: formId, suggestionsRequestKey }) => {
            const filterKey = suggestionsRequestKey
                ? suggestionsRequestTypes[suggestionsRequestKey].filterKey
                : `filter{${formId}.in}`;
            if (!state.current.query[filterKey]) {
                return acc;
            }
            return {
                ...acc,
                [filterKey]: castArray(state.current.query[filterKey])
            };
        }, {});
        setValues({
            ...newValues,
            ...(query.extent && { extent: query.extent })
        });
    }, [show, query]);

    function handleApply() {
        onChange(values);
        onClose();
    }

    function handleClear() {
        const emptyValues = Object.keys(values).reduce((acc, filterKey) => {
            if (filterKey === 'extent') {
                return {
                    ...acc,
                    [filterKey]: undefined
                };
            }
            return {
                ...acc,
                [filterKey]: []
            };
        }, {});
        setValues(emptyValues);
        onChange(emptyValues);
    }

    if (!show) {
        return null;
    }

    return (
        <div className="gn-filter-form">
            <div className="gn-filter-form-header">
                <div className="gn-filter-form-title"><Message msgId="gnhome.advancedSearch"/></div>
                <Button
                    variant="default"
                    onClick={() => onClose()}
                >
                    <FaIcon name="times"/>
                </Button>
            </div>
            <Form
                style={style}
            >
                <Form.Row>
                    {fields.length > 0 && <Col ref={leftColumnNode}>
                        {fields.map(({
                            id: formId,
                            labelId,
                            label,
                            placeholderId,
                            description,
                            options,
                            suggestionsRequestKey
                        }) => {
                            const key = `${id}-${formId || suggestionsRequestKey}`;
                            const filterKey = suggestionsRequestKey
                                ? suggestionsRequestTypes[suggestionsRequestKey].filterKey
                                : `filter{${formId}.in}`;
                            const currentValues = suggestionsRequestKey
                                ? values[suggestionsRequestTypes[suggestionsRequestKey].filterKey] || []
                                : values[filterKey] || [];
                            const optionsProp = suggestionsRequestKey
                                ? { loadOptions: suggestionsRequestTypes[suggestionsRequestKey].loadOptions }
                                : { options: options.map(option => ({ value: option, label: option })) };
                            const Select = suggestionsRequestKey ? SelectAsync : SelectSync;
                            return (
                                <Form.Group
                                    key={key}
                                    controlId={key}
                                >
                                    <Form.Label><strong>{labelId ? <Message msgId={labelId}/> : label}</strong></Form.Label>
                                    <Select
                                        value={currentValues.map((value) => ({ value, label: getFilterLabelById(filterKey, value) || value }))}
                                        multi
                                        placeholder={placeholderId}
                                        onChange={(selected) => {
                                            setValues({
                                                ...state.current.values,
                                                [filterKey]: selected.map(({ value }) => value)
                                            });
                                        }}
                                        { ...optionsProp }
                                    />
                                    {description &&
                                        <Form.Text className="text-muted">
                                            {description}
                                        </Form.Text>}
                                </Form.Group>
                            );
                        })}
                    </Col>}
                    <Col style={{
                        height: leftColumnNode.current?.clientHeight || 400
                    }}>
                        <FilterByExtent
                            id={id}
                            extent={values.extent}
                            queryExtent={query.extent}
                            layers={extentProps?.layers}
                            vectorLayerStyle={extentProps?.style}
                            onChange={({extent}) =>
                                setValues({
                                    ...values,
                                    extent
                                })
                            }
                        />
                    </Col>
                </Form.Row>
            </Form>
            <div className="gn-filter-form-footer">
                <Button
                    variant="default"
                    onClick={handleApply}
                >
                    <Message msgId="gnhome.apply"/>
                </Button>
                <Button
                    variant="default"
                    onClick={handleClear}
                >
                    <Message msgId="gnhome.clearFilters"/>
                </Button>
            </div>
        </div>
    );
}

FilterForm.defaultProps = {
    fields: [],
    onChange: () => {},
    suggestionsRequestTypes: {}
};

export default FilterForm;
