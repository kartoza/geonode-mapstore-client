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
    purgeMapInfoResults,
    hideMapinfoMarker
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
import igracSelectWellReducer from '@js/reducers/igracSelectWell';
import {
    IGRAC_SELECT_WELL_SET_GEOM,
    IGRAC_SELECT_WELL_REMOVE_GEOM,
    IGRAC_SELECT_WELL_SET_DATA,
    IGRAC_SELECT_WELL_CLEAR,
    activateIgracSelectWell,
    deactivateIgracSelectWell,
    setIgracSelectWellType,
    setIgracSelectWellGeom,
    removeIgracSelectWellGeom,
    setIgracSelectWellData,
    setIgracSelectWellProgress,
    clearIgracSelectWell,
    toggleIgracSyncWithGeom
} from '@js/actions/igracSelectWell';
import { igracSyncWithGeometries } from '@js/selectors/igracSelectWell';
import {
    isIgracSelectWellActive,
    igracSelectWellGeometryType,
    igracSelectWellGeometries,
    igracSelectWellData
} from '@js/selectors/igracSelectWell';
import { isMapInfoOpen } from '@mapstore/framework/selectors/mapInfo';
import { isFeatureGridOpen } from '@mapstore/framework/selectors/featuregrid';
import { getSelectedLayers, layersSelector, selectedNodesSelector } from '@mapstore/framework/selectors/layers';
import { SELECT_NODE } from '@mapstore/framework/actions/layers';
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

const FILTER_LAYER_ID = 'igrac-select-well-layer';
const FILTER_LAYER_OWNER = 'igracSelectWell';

const WFS_GEOM_ATTR = 'location';

const isGroundwaterLayer = layer => layer?.type === 'wms' && layer?.visibility && layer?.name?.includes('groundwater:');

function geomToGML(geometry) {
    if (geometry.type === 'Polygon') {
        const coords = geometry.coordinates[0].map(c => `${c[0]} ${c[1]}`).join(' ');
        return `<gml:Polygon srsName="EPSG:4326"><gml:exterior><gml:LinearRing><gml:posList>${coords}</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon>`;
    }
    if (geometry.type === 'Point') {
        return `<gml:Point srsName="EPSG:4326"><gml:pos>${geometry.coordinates[0]} ${geometry.coordinates[1]}</gml:pos></gml:Point>`;
    }
    return null;
}

const WFS_PAGE_SIZE = 1000;

function buildWFSPost(geometry, layerUrl, layerName, startIndex = 0) {
    const gml = geomToGML(geometry);
    if (!gml || !layerUrl || !layerName) return null;
    const body = '<wfs:GetFeature service="WFS" version="1.1.0"' +
        ' xmlns:gml="http://www.opengis.net/gml"' +
        ' xmlns:wfs="http://www.opengis.net/wfs"' +
        ' xmlns:ogc="http://www.opengis.net/ogc"' +
        ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
        ' xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd"' +
        ` startIndex="${startIndex}" maxFeatures="${WFS_PAGE_SIZE}">` +
        `<wfs:Query typeName="${layerName}" srsName="EPSG:4326">` +
        '<wfs:SortBy><wfs:SortProperty><ogc:PropertyName>id</ogc:PropertyName>' +
        '<wfs:SortOrder>A</wfs:SortOrder></wfs:SortProperty></wfs:SortBy>' +
        `<ogc:Filter><ogc:Intersects><ogc:PropertyName>${WFS_GEOM_ATTR}</ogc:PropertyName>` +
        `${gml}</ogc:Intersects></ogc:Filter>` +
        '</wfs:Query></wfs:GetFeature>';
    return { url: `${layerUrl}?service=WFS&outputFormat=application/json`, body };
}

function fetchWFSPage(geometry, layerUrl, layerName, startIndex) {
    const post = buildWFSPost(geometry, layerUrl, layerName, startIndex);
    return fetch(post.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: post.body
    }).then(r => r.json());
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
        [isIgracSelectWellActive, igracSelectWellGeometryType],
        (active, geometryType) => ({ active, geometryType })
    ),
    { onDrawEnd: setIgracSelectWellGeom }
)(DrawFilterMapSupportComponent);

const IDENTIFY_PANEL_WIDTH = 589;

const GEOM_TYPE_LABELS = { Point: 'Point', Polygon: 'Polygon' };

function IgracSelectWellPanelComponent({
    enabled,
    active,
    geometryType,
    geometries,
    data,
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
    }, [geometries.length]);

    if (!enabled) {
        return null;
    }

    const rightOffset = identifyOpen ? IDENTIFY_PANEL_WIDTH + 10 : 46;
    const hasGeometries = geometries.length > 0;
    const isAnyLoading = data.some(d => d === null || d?.loading);

    return (
        <div
            className="igrac-select-well-container"
            style={{ position: 'absolute', zIndex: 100, right: rightOffset, top: 48 }}
        >
            {active && <style>{`.ol-viewport{cursor:${geometryType === 'Point' ? 'pointer' : 'crosshair'}!important}`}</style>}
            <style>{'.igrac-remove-btn:focus{box-shadow:none!important}'}</style>
            <div style={{ background: '#fff', padding: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.3)', minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <strong>Select Well</strong>
                    <Button variant="default" size="xs" onClick={onClose}>
                        <Glyphicon glyph="remove" />
                    </Button>
                </div>

                {!hasGroundwaterLayer && (
                    <div style={{ fontSize: 12, color: '#a94442', marginBottom: 8 }}>
                        <Glyphicon glyph="warning-sign" style={{ marginRight: 4 }} />
                        Only available for groundwater layers
                    </div>
                )}

                {hasGroundwaterLayer && (
                    <>
                        {hasGeometries && (
                            <div style={{ marginBottom: 8 }}>
                                <div ref={listRef} id="igrac-select-well-geometry-list" style={{ maxHeight: "30vh", overflowY: 'auto' }}>
                                    {geometries.map((geom, i) => {
                                        const itemData = data[i];
                                        const loading = itemData === null || itemData?.loading;
                                        const count = Array.isArray(itemData)
                                            ? itemData.length
                                            : itemData?.features?.length ?? null;
                                        const total = itemData?.total ?? null;
                                        return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#31708f' }}>
                                                <span>
                                                    <Glyphicon
                                                        glyph={loading ? 'refresh' : 'ok-circle'}
                                                        style={{ marginRight: 4 }}
                                                    />
                                                    {GEOM_TYPE_LABELS[geom.type] || geom.type} {i + 1}
                                                    {loading && count === null && <em style={{ marginLeft: 4, color: '#999' }}>loading...</em>}
                                                    {loading && count !== null && (
                                                        <em style={{ marginLeft: 4, color: '#999' }}>{count}/{total} wells...</em>
                                                    )}
                                                    {!loading && count !== null && (
                                                        <strong style={{ marginLeft: 4 }}>({count} wells)</strong>
                                                    )}
                                                </span>
                                                <Button className={"igrac-remove-btn"} variant="default" size="xs" onClick={() => onRemove(i)}>
                                                    <Glyphicon glyph="1-close" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <Button variant="warning" size="sm" onClick={onClear} style={{ width: '100%', marginTop: 4 }}>
                                    <Glyphicon glyph="remove" /> Clear all
                                </Button>
                            </div>
                        )}

                        <div>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {GEOMETRY_TYPES.map(({ type, glyph, label }) => (
                                    <TooltipButton
                                        key={type}
                                        tooltip={isAnyLoading ? 'Loading results, please wait...' : label}
                                        tooltipPosition="bottom"
                                        variant="primary"
                                        size="sm"
                                        disabled={isAnyLoading}
                                        className={active && geometryType === type ? 'active' : ''}
                                        onClick={() => { onSetType(type); onActivate(); }}
                                    >
                                        <Glyphicon glyph={glyph} />
                                    </TooltipButton>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const IgracSelectWellPanel = connect(
    createSelector(
        [
            state => state?.controls?.igracSelectWell?.enabled || false,
            isIgracSelectWellActive,
            igracSelectWellGeometryType,
            igracSelectWellGeometries,
            igracSelectWellData,
            state => {
                const selectedIds = selectedNodesSelector(state);
                const allLayers = layersSelector(state);
                const targetLayers = selectedIds.length > 0
                    ? allLayers.filter(l => selectedIds.includes(l.id))
                    : allLayers;
                return targetLayers.some(isGroundwaterLayer);
            },
            isMapInfoOpen
        ],
        (enabled, active, geometryType, geometries, data, hasGroundwaterLayer, identifyOpen) => ({
            enabled, active, geometryType, geometries, data, hasGroundwaterLayer, identifyOpen
        })
    ),
    {
        onClose: toggleControl.bind(null, 'igracSelectWell', null),
        onActivate: activateIgracSelectWell,
        onSetType: setIgracSelectWellType,
        onRemove: removeIgracSelectWellGeom,
        onClear: clearIgracSelectWell
    }
)(IgracSelectWellPanelComponent);

const igracSelectWellPointClickEpic = (action$, store) =>
    action$.ofType(CLICK_ON_MAP)
        .filter(() => {
            const state = store.getState();
            return isIgracSelectWellActive(state) &&
                igracSelectWellGeometryType(state) === 'Point';
        })
        .switchMap(({ point }) => {
            const { lat, lng } = point.latlng;
            return Observable.of(
                setIgracSelectWellGeom({ type: 'Point', coordinates: [lng, lat] })
            );
        });

// Reads full geometry list from store (reducer already applied the action)
const igracSelectWellShowGeomEpic = (action$, store) =>
    action$.ofType(IGRAC_SELECT_WELL_SET_GEOM, IGRAC_SELECT_WELL_REMOVE_GEOM)
        .switchMap(({ type }) => {
            const geometries = igracSelectWellGeometries(store.getState());
            const isRemove = type === IGRAC_SELECT_WELL_REMOVE_GEOM;
            if (geometries.length === 0) {
                return Observable.of(
                    removeAdditionalLayer({ owner: FILTER_LAYER_OWNER }),
                    ...(isRemove ? [deactivateIgracSelectWell()] : [])
                );
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
                }),
                ...(isRemove ? [deactivateIgracSelectWell()] : [])
            );
        });

const igracSelectWellClearGeomEpic = (action$) =>
    action$.ofType(IGRAC_SELECT_WELL_CLEAR)
        .switchMap(() =>
            Observable.of(
                removeAdditionalLayer({ owner: FILTER_LAYER_OWNER }),
                deactivateIgracSelectWell()
            )
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
const igracSelectWellFetchEpic = (action$, store) =>
    action$.ofType(IGRAC_SELECT_WELL_SET_GEOM)
        .mergeMap(() => {
            const state = store.getState();
            const geometries = igracSelectWellGeometries(state);
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
                    if (!layer.url || !layer.name) return Observable.empty();

                    function fetchPages(startIndex, accumulated) {
                        return Observable.fromPromise(fetchWFSPage(wfsGeometry, layer.url, layer.name, startIndex))
                            .mergeMap(data => {
                                const features = data.features || [];
                                const all = [...accumulated, ...features];
                                const total = data.totalFeatures ?? data.numberMatched ?? 0;
                                if (features.length === WFS_PAGE_SIZE && all.length < total) {
                                    return Observable.concat(
                                        Observable.of(setIgracSelectWellProgress(index, all, total)),
                                        fetchPages(startIndex + WFS_PAGE_SIZE, all)
                                    );
                                }
                                return Observable.of(setIgracSelectWellData(index, all));
                            });
                    }

                    return fetchPages(0, [])
                        .catch(() => Observable.of(setIgracSelectWellData(index, [])));
                });
        });

function buildInjectActions(layer, allFeatures, reqId, requestParams) {
    if (allFeatures.length === 0) return [purgeMapInfoResults()];
    const layerMetadata = {
        title: layer.title || layer.name,
        name: layer.name,
        features: allFeatures,
        featuresCrs: 'EPSG:4326',
        viewer: layer.featureInfo?.viewer || {},
        featureInfo: layer.featureInfo ? { ...layer.featureInfo } : {},
        fields: layer.fields,
        fromWellSelection: true
    };
    return [
        loadFeatureInfo(reqId, { type: 'FeatureCollection', features: allFeatures }, requestParams, layerMetadata, layer),
        forceUpdateMapLayout()
    ];
}

const igracSelectWellInjectIdentifyEpic = (action$, store) =>
    action$.ofType(IGRAC_SELECT_WELL_SET_GEOM)
        .switchMap(() => {
            const state = store.getState();
            if (isFeatureGridOpen(state)) return Observable.empty();
            const layer = layersSelector(state).find(isGroundwaterLayer);
            if (!layer) return Observable.empty();

            const reqId = uuid.v1();
            const requestParams = { service: 'WFS', typeName: layer.name, info_format: 'application/json' };

            const openSpinner = Observable.of(
                purgeMapInfoResults(),
                newMapInfoRequest(reqId, requestParams)
            );

            const waitAndInject = action$.ofType(IGRAC_SELECT_WELL_SET_DATA)
                .filter(() => !igracSelectWellData(store.getState()).some(d => d === null || d?.loading))
                .take(1)
                .switchMap(() => {
                    const allFeatures = igracSelectWellData(store.getState()).flatMap(d => (Array.isArray(d) ? d : []));
                    return Observable.of(...buildInjectActions(layer, allFeatures, reqId, requestParams)).delay(0);
                });

            return openSpinner.concat(waitAndInject);
        });

const igracSelectWellRemoveGeomIdentifyEpic = (action$, store) =>
    action$.ofType(IGRAC_SELECT_WELL_REMOVE_GEOM)
        .switchMap(() => {
            const state = store.getState();
            if (isFeatureGridOpen(state)) return Observable.empty();
            const layer = layersSelector(state).find(isGroundwaterLayer);
            if (!layer) return Observable.empty();

            const data = igracSelectWellData(state);
            if (data.some(d => d === null || d?.loading)) return Observable.empty();

            const geometries = igracSelectWellGeometries(state);
            if (geometries.length === 0) return Observable.of(purgeMapInfoResults());

            const reqId = uuid.v1();
            const requestParams = { service: 'WFS', typeName: layer.name, info_format: 'application/json' };
            const allFeatures = data.flatMap(d => (Array.isArray(d) ? d : []));
            return Observable.of(
                purgeMapInfoResults(),
                newMapInfoRequest(reqId, requestParams),
                ...buildInjectActions(layer, allFeatures, reqId, requestParams)
            ).delay(0);
        });

const igracSelectWellCloseClearEpic = (action$, store) =>
    action$.ofType(TOGGLE_CONTROL)
        .filter(({ control }) => control === 'igracSelectWell')
        .switchMap(() => {
            const panelEnabled = store.getState()?.controls?.igracSelectWell?.enabled;
            if (!panelEnabled) {
                const state = store.getState();
                return Observable.of(
                    clearIgracSelectWell(),
                    changeDrawingStatus('stop', '', 'igracSelectWell', []),
                    ...(igracSyncWithGeometries(state) ? [toggleIgracSyncWithGeom()] : [])
                );
            }
            return Observable.of(
                setIgracSelectWellType('Point'),
                activateIgracSelectWell(),
                changeDrawingStatus('create', '', 'igracSelectWell', []),
                hideMapinfoMarker()
            );
        });

// When selected nodes in TOC change, clear all geometries if panel is enabled
const igracSelectWellSelectionChangeEpic = (action$, store) =>
    action$.ofType(SELECT_NODE)
        .filter(() => {
            const state = store.getState();
            return state?.controls?.igracSelectWell?.enabled &&
                igracSelectWellGeometries(state).length > 0;
        })
        .switchMap(() => Observable.of(clearIgracSelectWell()));

export default createPlugin('IgracSelectWell', {
    component: IgracSelectWellPanel,
    containers: {
        SidebarMenu: {
            name: 'igracSelectWell',
            position: 10,
            icon: <Glyphicon glyph="pencil" />,
            tooltip: 'Select Well',
            action: toggleControl.bind(null, 'igracSelectWell', null),
            toggle: true,
            toggleControl: 'igracSelectWell',
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
            name: 'IgracSelectWell',
            Tool: DrawFilterMapSupport,
            alwaysRender: true
        }
    },
    reducers: { igracSelectWell: igracSelectWellReducer },
    epics: {
        igracSelectWellPointClickEpic,
        igracSelectWellShowGeomEpic,
        igracSelectWellClearGeomEpic,
        igracSelectWellCloseClearEpic,
        igracSelectWellFetchEpic,
        igracSelectWellInjectIdentifyEpic,
        igracSelectWellRemoveGeomIdentifyEpic,
        igracSelectWellSelectionChangeEpic
    }
});
