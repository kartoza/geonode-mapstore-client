import React, { lazy, Suspense, useEffect } from 'react';
import { Observable } from 'rxjs';
import { connect } from 'react-redux';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { createSelector } from 'reselect';
import { Glyphicon } from 'react-bootstrap';
import { toggleControl, TOGGLE_CONTROL } from '@mapstore/framework/actions/controls';
import { CLICK_ON_MAP } from '@mapstore/framework/actions/map';
import { changeMapInfoState } from '@mapstore/framework/actions/mapInfo';
import {
    updateAdditionalLayer,
    removeAdditionalLayer
} from '@mapstore/framework/actions/additionallayers';
import Button from '@js/components/Button';
import tooltip from '@mapstore/framework/components/misc/enhancers/tooltip';
import igracDrawingFilterReducer from '@js/reducers/igracDrawingFilter';
import {
    IGRAC_DRAWING_FILTER_SET_GEOM,
    IGRAC_DRAWING_FILTER_REMOVE_GEOM,
    IGRAC_DRAWING_FILTER_CLEAR,
    activateIgracDrawingFilter,
    deactivateIgracDrawingFilter,
    setIgracDrawingFilterType,
    setIgracDrawingFilterGeom,
    removeIgracDrawingFilterGeom,
    clearIgracDrawingFilter
} from '@js/actions/igracDrawingFilter';
import {
    isIgracDrawingFilterActive,
    igracDrawingFilterGeometryType,
    igracDrawingFilterGeometries
} from '@js/selectors/igracDrawingFilter';
import { isMapInfoOpen } from '@mapstore/framework/selectors/mapInfo';

const DrawGeometrySupportOL = lazy(() =>
    import(/* webpackChunkName: 'supports/olDrawGeometrySupport' */ '@mapstore/framework/components/map/openlayers/DrawGeometrySupport')
);

const GEOMETRY_TYPES = [
    { type: 'Point',   glyph: '1-point',  label: 'Point' },
    { type: 'Polygon', glyph: 'polygon',  label: 'Polygon' }
];

const FILTER_LAYER_ID = 'igrac-drawing-filter-layer';
const FILTER_LAYER_OWNER = 'igracDrawingFilter';

const FILTER_LAYER_STYLE = {
    format: 'geostyler',
    body: {
        name: '',
        rules: [
            {
                name: 'polygon',
                filter: ['==', 'geometryType', 'Polygon'],
                symbolizers: [{
                    kind: 'Fill',
                    color: '#FF6B35',
                    fillOpacity: 0.15,
                    outlineColor: '#FF6B35',
                    outlineWidth: 2,
                    outlineOpacity: 1
                }]
            },
            {
                name: 'point',
                filter: ['==', 'geometryType', 'Point'],
                symbolizers: [{
                    kind: 'Mark',
                    wellKnownName: 'circle',
                    color: '#FF6B35',
                    fillOpacity: 0.8,
                    strokeColor: '#FF6B35',
                    strokeWidth: 2,
                    radius: 6
                }]
            }
        ]
    }
};

const TooltipButton = tooltip(Button);

const CURSORS = {
    Point: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='4' fill='%23FF6B35' stroke='white' stroke-width='1.5'/><line x1='12' y1='1' x2='12' y2='8' stroke='%23FF6B35' stroke-width='2' stroke-linecap='round'/><line x1='12' y1='16' x2='12' y2='23' stroke='%23FF6B35' stroke-width='2' stroke-linecap='round'/><line x1='1' y1='12' x2='8' y2='12' stroke='%23FF6B35' stroke-width='2' stroke-linecap='round'/><line x1='16' y1='12' x2='23' y2='12' stroke='%23FF6B35' stroke-width='2' stroke-linecap='round'/></svg>\") 12 12, crosshair",
    Polygon: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><polygon points='12,3 21,18 3,18' fill='none' stroke='%23FF6B35' stroke-width='2' stroke-linejoin='round'/><line x1='12' y1='1' x2='12' y2='6' stroke='%23FF6B35' stroke-width='1.5'/><line x1='12' y1='18' x2='12' y2='23' stroke='%23FF6B35' stroke-width='1.5'/><line x1='1' y1='12' x2='6' y2='12' stroke='%23FF6B35' stroke-width='1.5'/><line x1='18' y1='12' x2='23' y2='12' stroke='%23FF6B35' stroke-width='1.5'/></svg>\") 12 12, crosshair"
};

function DrawFilterMapSupportComponent({ map, active, geometryType, onDrawEnd }) {
    useEffect(() => {
        if (!map || !active) return () => {};
        const viewport = map.getViewport();
        viewport.style.cursor = CURSORS[geometryType] || 'crosshair';
        return () => { viewport.style.cursor = ''; };
    }, [map, active, geometryType]);

    if (!active || !map || geometryType === 'Point') {
        return null;
    }

    return (
        <Suspense fallback={null}>
            <DrawGeometrySupportOL
                map={map}
                active={active}
                geometryType={geometryType}
                onDrawEnd={({ feature }) => onDrawEnd(feature.geometry)}
            />
        </Suspense>
    );
}

const DrawFilterMapSupport = connect(
    createSelector(
        [isIgracDrawingFilterActive, igracDrawingFilterGeometryType],
        (active, geometryType) => ({ active, geometryType })
    ),
    { onDrawEnd: setIgracDrawingFilterGeom }
)(DrawFilterMapSupportComponent);

const IDENTIFY_PANEL_WIDTH = 589;

const GEOM_TYPE_LABELS = { Point: 'Point', Polygon: 'Polygon' };

function IgracDrawingFilterPanelComponent({
    enabled,
    active,
    geometryType,
    filterGeometries,
    identifyOpen,
    onClose,
    onActivate,
    onDeactivate,
    onSetType,
    onRemove,
    onClear
}) {
    if (!enabled) {
        return null;
    }

    const rightOffset = identifyOpen ? IDENTIFY_PANEL_WIDTH + 10 : 46;
    const hasGeometries = filterGeometries.length > 0;

    return (
        <div
            className="igrac-drawing-filter-container"
            style={{ position: 'absolute', zIndex: 100, right: rightOffset, top: 48 }}
        >
            <div style={{ background: '#fff', padding: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.3)', minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong>Drawing Filter</strong>
                    <Button variant="default" size="xs" onClick={onClose}>
                        <Glyphicon glyph="1-close" />
                    </Button>
                </div>

                {hasGeometries && (
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ maxHeight: "30vh", overflowY: 'auto' }}>
                            {filterGeometries.map((geom, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#31708f' }}>
                                    <span>
                                        <Glyphicon glyph="ok-circle" style={{ marginRight: 4 }} />
                                        {GEOM_TYPE_LABELS[geom.type] || geom.type} {i + 1}
                                    </span>
                                    <Button variant="default" size="xs" onClick={() => onRemove(i)}>
                                        <Glyphicon glyph="remove" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button variant="warning" size="sm" onClick={onClear} style={{ width: '100%', marginTop: 4 }}>
                            <Glyphicon glyph="remove" /> Clear all
                        </Button>
                    </div>
                )}

                {active ? (
                    <div>
                        <div style={{ marginBottom: 8, color: '#8a6d3b', fontSize: 12 }}>
                            {geometryType === 'Point' ? 'Click on the map...' : `Drawing ${geometryType}...`}
                        </div>
                        <Button variant="danger" size="sm" onClick={onDeactivate} style={{ width: '100%' }}>
                            <Glyphicon glyph="remove" /> Cancel
                        </Button>
                    </div>
                ) : (
                    <div>
                        <div style={{ marginBottom: 6, fontSize: 12, color: '#666' }}>
                            {hasGeometries ? 'Add another:' : 'Select geometry type:'}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {GEOMETRY_TYPES.map(({ type, glyph, label }) => (
                                <TooltipButton
                                    key={type}
                                    tooltip={label}
                                    tooltipPosition="bottom"
                                    variant={geometryType === type ? 'primary' : 'default'}
                                    size="sm"
                                    onClick={() => { onSetType(type); onActivate(); }}
                                >
                                    <Glyphicon glyph={glyph} />
                                </TooltipButton>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const IgracDrawingFilterPanel = connect(
    createSelector(
        [
            state => state?.controls?.igracDrawingFilter?.enabled || false,
            isIgracDrawingFilterActive,
            igracDrawingFilterGeometryType,
            igracDrawingFilterGeometries,
            isMapInfoOpen
        ],
        (enabled, active, geometryType, filterGeometries, identifyOpen) => ({
            enabled, active, geometryType, filterGeometries, identifyOpen
        })
    ),
    {
        onClose: toggleControl.bind(null, 'igracDrawingFilter', null),
        onActivate: activateIgracDrawingFilter,
        onDeactivate: deactivateIgracDrawingFilter,
        onSetType: setIgracDrawingFilterType,
        onRemove: removeIgracDrawingFilterGeom,
        onClear: clearIgracDrawingFilter
    }
)(IgracDrawingFilterPanelComponent);

const igracDrawingFilterPointClickEpic = (action$, store) =>
    action$.ofType(CLICK_ON_MAP)
        .filter(() => {
            const state = store.getState();
            return isIgracDrawingFilterActive(state) &&
                igracDrawingFilterGeometryType(state) === 'Point';
        })
        .switchMap(({ point }) => {
            const { lat, lng } = point.latlng;
            return Observable.of(
                setIgracDrawingFilterGeom({ type: 'Point', coordinates: [lng, lat] })
            );
        });

const igracDrawingFilterBlockIdentifyEpic = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({ control }) => control === 'igracDrawingFilter')
        .switchMap(() => {
            const panelEnabled = store.getState()?.controls?.igracDrawingFilter?.enabled;
            return Observable.of(changeMapInfoState(!panelEnabled));
        });

// Reads full geometry list from store (reducer already applied the action)
const igracDrawingFilterShowGeomEpic = (action$, store) =>
    action$.ofType(IGRAC_DRAWING_FILTER_SET_GEOM, IGRAC_DRAWING_FILTER_REMOVE_GEOM)
        .switchMap(() => {
            const geometries = igracDrawingFilterGeometries(store.getState());
            if (geometries.length === 0) {
                return Observable.of(removeAdditionalLayer({ owner: FILTER_LAYER_OWNER }));
            }
            return Observable.of(
                updateAdditionalLayer(FILTER_LAYER_ID, FILTER_LAYER_OWNER, 'overlay', {
                    type: 'vector',
                    id: FILTER_LAYER_ID,
                    name: 'Drawing Filter',
                    visibility: true,
                    features: geometries.map((geometry, i) => ({
                        type: 'Feature',
                        id: `${FILTER_LAYER_ID}-${i}`,
                        geometry,
                        properties: { geometryType: geometry.type }
                    })),
                    style: FILTER_LAYER_STYLE
                })
            );
        });

const igracDrawingFilterClearGeomEpic = (action$) =>
    action$.ofType(IGRAC_DRAWING_FILTER_CLEAR)
        .switchMap(() =>
            Observable.of(removeAdditionalLayer({ owner: FILTER_LAYER_OWNER }))
        );

export default createPlugin('IgracDrawingFilter', {
    component: IgracDrawingFilterPanel,
    containers: {
        SidebarMenu: {
            name: 'igracDrawingFilter',
            position: 10,
            icon: <Glyphicon glyph="pencil" />,
            tooltip: 'Drawing Filter',
            action: toggleControl.bind(null, 'igracDrawingFilter', null),
            toggle: true,
            toggleControl: 'igracDrawingFilter',
            toggleProperty: 'enabled',
            doNotHide: true,
            priority: 2
        },
        Map: {
            name: 'IgracDrawingFilter',
            Tool: DrawFilterMapSupport,
            alwaysRender: true
        }
    },
    reducers: { igracDrawingFilter: igracDrawingFilterReducer },
    epics: {
        igracDrawingFilterPointClickEpic,
        igracDrawingFilterBlockIdentifyEpic,
        igracDrawingFilterShowGeomEpic,
        igracDrawingFilterClearGeomEpic
    }
});
