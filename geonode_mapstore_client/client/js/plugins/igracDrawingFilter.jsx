import React, { lazy, Suspense, useRef, useEffect } from 'react';
import { Observable } from 'rxjs';
import { connect } from 'react-redux';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { createSelector } from 'reselect';
import { Glyphicon } from 'react-bootstrap';
import { toggleControl, TOGGLE_CONTROL } from '@mapstore/framework/actions/controls';
import { CLICK_ON_MAP } from '@mapstore/framework/actions/map';
import {
    newMapInfoRequest,
    loadFeatureInfo,
    purgeMapInfoResults
} from '@mapstore/framework/actions/mapInfo';
import { changeDrawingStatus } from '@mapstore/framework/actions/draw';
import { forceUpdateMapLayout } from '@mapstore/framework/actions/maplayout';
import uuid from 'uuid';
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
    IGRAC_DRAWING_FILTER_SET_DATA,
    IGRAC_DRAWING_FILTER_CLEAR,
    activateIgracDrawingFilter,
    setIgracDrawingFilterType,
    setIgracDrawingFilterGeom,
    removeIgracDrawingFilterGeom,
    setIgracDrawingFilterData,
    clearIgracDrawingFilter
} from '@js/actions/igracDrawingFilter';
import {
    isIgracDrawingFilterActive,
    igracDrawingFilterGeometryType,
    igracDrawingFilterGeometries,
    igracDrawingFilterData
} from '@js/selectors/igracDrawingFilter';
import { isMapInfoOpen } from '@mapstore/framework/selectors/mapInfo';
import { getSelectedLayers, layersSelector } from '@mapstore/framework/selectors/layers';
import { mapSelector } from '@mapstore/framework/selectors/map';
import { updatePointWithGeometricFilter } from '@mapstore/framework/utils/IdentifyUtils';
import { reproject } from '@mapstore/framework/utils/CoordinatesUtils';

const DrawGeometrySupportOL = lazy(() =>
    import(/* webpackChunkName: 'supports/olDrawGeometrySupport' */ '@mapstore/framework/components/map/openlayers/DrawGeometrySupport')
);

const GEOMETRY_TYPES = [
    { type: 'Point',   glyph: '1-point',  label: 'Point' },
    { type: 'Polygon', glyph: 'polygon',  label: 'Polygon' }
];

const FILTER_LAYER_ID = 'igrac-drawing-filter-layer';
const FILTER_LAYER_OWNER = 'igracDrawingFilter';

const WFS_GEOM_ATTR = 'location';

const isGroundwaterLayer = layer => layer?.type === 'wms' && layer?.visibility && layer?.name?.includes('groundwater:');

function geomToWKT(geom) {
    if (geom.type === 'Point') {
        return `SRID=4326;POINT(${geom.coordinates[0]} ${geom.coordinates[1]})`;
    }
    if (geom.type === 'Polygon') {
        const ring = geom.coordinates[0].map(c => `${c[0]} ${c[1]}`).join(',');
        return `SRID=4326;POLYGON((${ring}))`;
    }
    return null;
}

function buildWFSUrl(geometry, layerUrl, layerName) {
    const wkt = geomToWKT(geometry);
    if (!wkt || !layerUrl || !layerName) return null;
    const params = new URLSearchParams({
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeNames: layerName,
        outputFormat: 'application/json',
        count: '10000',
        CQL_FILTER: `INTERSECTS(${WFS_GEOM_ATTR},${wkt})`
    });
    return `${layerUrl}?${params.toString()}`;
}

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

function DrawFilterMapSupportComponent({ map, active, geometryType, onDrawEnd }) {
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
    filterData,
    hasGroundwaterLayer,
    identifyOpen,
    onClose,
    onActivate,
    onSetType,
    onRemove,
    onClear
}) {
    const listRef = useRef(null);
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [filterGeometries.length]);

    if (!enabled) {
        return null;
    }

    const rightOffset = identifyOpen ? IDENTIFY_PANEL_WIDTH + 10 : 46;
    const hasGeometries = filterGeometries.length > 0;

    const totalWells = filterData.reduce((sum, d) => sum + (Array.isArray(d) ? d.length : 0), 0);
    const isAnyLoading = filterData.some(d => d === null);
    const downloadDisabled = isAnyLoading || totalWells === 0 || totalWells > 100000;
    const downloadTooltip = isAnyLoading
        ? 'Still loading…'
        : totalWells === 0
            ? 'No wells to download'
            : totalWells > 100000
                ? 'Too many wells (max 100,000)'
                : null;

    function handleDownload() {
        const allFeatures = filterData.flatMap(d => (Array.isArray(d) ? d : []));
        const seen = new Set();
        const unique = allFeatures.filter(f => {
            const key = f.id ?? JSON.stringify(f.properties);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        const blob = new Blob(
            [JSON.stringify({ type: 'FeatureCollection', features: unique }, null, 2)],
            { type: 'application/json' }
        );
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'groundwater_wells.geojson';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    return (
        <div
            className="igrac-drawing-filter-container"
            style={{ position: 'absolute', zIndex: 100, right: rightOffset, top: 48 }}
        >
            {active && <style>{`.ol-viewport{cursor:${geometryType === 'Point' ? 'pointer' : 'crosshair'}!important}`}</style>}
            <div style={{ background: '#fff', padding: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.3)', minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong>Select Well</strong>
                    <Button variant="default" size="xs" onClick={onClose}>
                        <Glyphicon glyph="1-close" />
                    </Button>
                </div>

                {!hasGroundwaterLayer && (
                    <div style={{ fontSize: 12, color: '#a94442', marginBottom: 8 }}>
                        <Glyphicon glyph="warning-sign" style={{ marginRight: 4 }} />
                        Only available for groundwater layers
                    </div>
                )}

                {hasGeometries && (
                    <div style={{ marginBottom: 8 }}>
                        <div ref={listRef} id="igrac-geometry-list" style={{ maxHeight: "30vh", overflowY: 'auto' }}>
                            {filterGeometries.map((geom, i) => {
                                const data = filterData[i];
                                const loading = data === null;
                                const count = Array.isArray(data) ? data.length : null;
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#31708f' }}>
                                        <span>
                                            <Glyphicon
                                                glyph={loading ? 'refresh' : 'ok-circle'}
                                                style={{ marginRight: 4 }}
                                            />
                                            {GEOM_TYPE_LABELS[geom.type] || geom.type} {i + 1}
                                            {loading && <em style={{ marginLeft: 4, color: '#999' }}>loading...</em>}
                                            {count !== null && (
                                                <strong style={{ marginLeft: 4 }}>({count} wells)</strong>
                                            )}
                                        </span>
                                        <Button variant="default" size="xs" onClick={() => onRemove(i)}>
                                            <Glyphicon glyph="remove" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                        <Button variant="warning" size="sm" onClick={onClear} style={{ width: '100%', marginTop: 4 }}>
                            <Glyphicon glyph="remove" /> Clear all
                        </Button>
                        <style>{'.igrac-dl-btn:hover:not([disabled]){opacity:0.9}'}</style>
                        <TooltipButton
                            tooltip={downloadDisabled ? downloadTooltip : undefined}
                            tooltipPosition="bottom"
                            variant="primary"
                            size="sm"
                            disabled={downloadDisabled}
                            onClick={handleDownload}
                            className="igrac-dl-btn"
                            style={{ width: '100%', marginTop: 4, backgroundColor: 'var(--secondary)', color: '#fff' }}
                        >
                            <Glyphicon glyph="download-alt" /> Download all ({totalWells} wells)
                        </TooltipButton>
                    </div>
                )}

                <div>
                    <div style={{ marginBottom: 6, fontSize: 12, color: active ? '#8a6d3b' : '#666' }}>
                        {active
                            ? (geometryType === 'Point' ? 'Click on the map...' : `Drawing ${geometryType}...`)
                            : (hasGeometries ? 'Add another:' : 'Select geometry type:')}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {GEOMETRY_TYPES.map(({ type, glyph, label }) => (
                            <TooltipButton
                                key={type}
                                tooltip={label}
                                tooltipPosition="bottom"
                                variant="primary"
                                size="sm"
                                disabled={!hasGroundwaterLayer}
                                className={active && geometryType === type ? 'active' : ''}
                                onClick={() => { onSetType(type); onActivate(); }}
                            >
                                <Glyphicon glyph={glyph} />
                            </TooltipButton>
                        ))}
                    </div>
                </div>
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
            igracDrawingFilterData,
            state => layersSelector(state).some(isGroundwaterLayer),
            isMapInfoOpen
        ],
        (enabled, active, geometryType, filterGeometries, filterData, hasGroundwaterLayer, identifyOpen) => ({
            enabled, active, geometryType, filterGeometries, filterData, hasGroundwaterLayer, identifyOpen
        })
    ),
    {
        onClose: toggleControl.bind(null, 'igracDrawingFilter', null),
        onActivate: activateIgracDrawingFilter,
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
                    name: 'Select Well',
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

function pointToBufferedGeometry(geometry, mapState) {
    const [lng, lat] = geometry.coordinates;
    const projection = mapState?.projection || 'EPSG:3857';
    const buffered = updatePointWithGeometricFilter({ latlng: { lat, lng } }, projection);
    const circleRing = buffered?.geometricFilter?.value?.geometry?.coordinates?.[0];
    if (!circleRing) return geometry;
    const coords4326 = circleRing.map(([x, y]) => {
        const p = reproject([x, y], projection, 'EPSG:4326');
        return [p.x, p.y];
    });
    return { type: 'Polygon', coordinates: [coords4326] };
}

// On each SET_GEOM, fetch wells from the selected/active WMS layer via WFS + CQL_FILTER
const igracDrawingFilterFetchEpic = (action$, store) =>
    action$.ofType(IGRAC_DRAWING_FILTER_SET_GEOM)
        .mergeMap(() => {
            const state = store.getState();
            const geometries = igracDrawingFilterGeometries(state);
            const index = geometries.length - 1;
            const geometry = geometries[index];

            const wfsGeometry = geometry.type === 'Point'
                ? pointToBufferedGeometry(geometry, mapSelector(state))
                : geometry;

            // prefer selected groundwater layers; fall back to all visible groundwater layers
            const selected = getSelectedLayers(state).filter(isGroundwaterLayer);
            const layers = selected.length > 0
                ? selected
                : layersSelector(state).filter(isGroundwaterLayer);

            return Observable.from(layers)
                .mergeMap(layer => {
                    const url = buildWFSUrl(wfsGeometry, layer.url, layer.name);
                    if (!url) return Observable.empty();
                    return Observable.fromPromise(
                        fetch(url).then(r => r.json())
                    )
                        .map(data => setIgracDrawingFilterData(index, data.features || []))
                        .catch(() => Observable.of(setIgracDrawingFilterData(index, [])));
                });
        });

const igracDrawingFilterInjectIdentifyEpic = (action$, store) =>
    action$.ofType(IGRAC_DRAWING_FILTER_SET_GEOM)
        .switchMap(() => {
            const state = store.getState();
            const layer = layersSelector(state).find(isGroundwaterLayer);
            if (!layer) return Observable.empty();

            const reqId = uuid.v1();
            const requestParams = { service: 'WFS', typeName: layer.name, info_format: 'application/json' };

            // Open identify panel immediately with spinner
            const openSpinner = Observable.of(
                purgeMapInfoResults(),
                newMapInfoRequest(reqId, requestParams)
            );

            // Wait until all geometries have loaded data, then inject
            const waitAndInject = action$.ofType(IGRAC_DRAWING_FILTER_SET_DATA)
                .filter(() => !igracDrawingFilterData(store.getState()).some(d => d === null))
                .take(1)
                .switchMap(() => {
                    const s = store.getState();
                    const allFeatures = igracDrawingFilterData(s).flatMap(d => (Array.isArray(d) ? d : []));
                    if (allFeatures.length === 0) return Observable.of(purgeMapInfoResults());
                    const layerMetadata = {
                        title: layer.title || layer.name,
                        features: allFeatures,
                        featuresCrs: 'EPSG:4326',
                        viewer: layer.featureInfo?.viewer || {},
                        featureInfo: layer.featureInfo ? { ...layer.featureInfo } : {},
                        fields: layer.fields
                    };
                    const data = { type: 'FeatureCollection', features: allFeatures };
                    return Observable.of(
                        loadFeatureInfo(reqId, data, requestParams, layerMetadata, layer),
                        forceUpdateMapLayout()
                    ).delay(0);
                });

            return openSpinner.concat(waitAndInject);
        });

const igracDrawingFilterCloseClearEpic = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({ control }) => control === 'igracDrawingFilter')
        .switchMap(() => {
            const panelEnabled = store.getState()?.controls?.igracDrawingFilter?.enabled;
            if (!panelEnabled) {
                return Observable.of(
                    clearIgracDrawingFilter(),
                    changeDrawingStatus('stop', '', 'igracDrawingFilter', [])
                );
            }
            return Observable.of(
                setIgracDrawingFilterType('Point'),
                activateIgracDrawingFilter(),
                changeDrawingStatus('create', '', 'igracDrawingFilter', [])
            );
        });

export default createPlugin('IgracDrawingFilter', {
    component: IgracDrawingFilterPanel,
    containers: {
        SidebarMenu: {
            name: 'igracDrawingFilter',
            position: 10,
            icon: <Glyphicon glyph="pencil" />,
            tooltip: 'Select Well',
            action: toggleControl.bind(null, 'igracDrawingFilter', null),
            toggle: true,
            toggleControl: 'igracDrawingFilter',
            toggleProperty: 'enabled',
            doNotHide: true,
            priority: 2,
            selector: state => ({
                disabled: !layersSelector(state).some(isGroundwaterLayer),
                title: layersSelector(state).some(isGroundwaterLayer)
                    ? 'Select Well'
                    : 'Select Well — only available for groundwater layers'
            })
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
        igracDrawingFilterShowGeomEpic,
        igracDrawingFilterClearGeomEpic,
        igracDrawingFilterCloseClearEpic,
        igracDrawingFilterFetchEpic,
        igracDrawingFilterInjectIdentifyEpic
    }
});
