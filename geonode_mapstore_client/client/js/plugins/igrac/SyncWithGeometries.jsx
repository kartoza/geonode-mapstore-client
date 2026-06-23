import React from 'react';
import { connect } from 'react-redux';
import { Observable } from 'rxjs';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { createSelector } from 'reselect';
import { updateQuery } from '@mapstore/framework/actions/wfsquery';
import { CLOSE_FEATURE_GRID } from '@mapstore/framework/actions/featuregrid';
import SimpleTButton from '@mapstore/framework/components/data/featuregrid/toolbars/TButton';
import {
    IGRAC_SELECT_WELL_SET_GEOM,
    IGRAC_SELECT_WELL_REMOVE_GEOM,
    IGRAC_SELECT_WELL_CLEAR,
    IGRAC_TOGGLE_SYNC_WITH_GEOM,
    toggleIgracSyncWithGeom
} from '@js/actions/igracSelectWell';
import {
    igracSelectWellGeometries,
    igracSyncWithGeometries,
    hasIgracSelectWellGeometries
} from '@js/selectors/igracSelectWell';

const WFS_GEOM_ATTR = 'location';

function buildSpatialField(geometries) {
    return geometries.map(geom => ({
        attribute: WFS_GEOM_ATTR,
        operation: 'INTERSECTS',
        geometry: { ...geom, projection: 'EPSG:4326' }
    }));
}

function SyncWithGeometriesButton({ active, disabled, onClick }) {
    return (
        <SimpleTButton
            id="igrac-sync-geom"
            visible
            active={active}
            disabled={disabled}
            glyph="geometry-collection"
            tooltip="Sync data with drawn geometries"
            tooltipPosition="bottom"
            onClick={onClick}
        />
    );
}

const ConnectedButton = connect(
    createSelector(
        [igracSyncWithGeometries, hasIgracSelectWellGeometries],
        (syncOn, hasGeometries) => ({
            active: syncOn,
            disabled: !hasGeometries
        })
    ),
    { onClick: toggleIgracSyncWithGeom }
)(SyncWithGeometriesButton);

const igracSyncWithGeometriesEpic = (action$, store) =>
    action$.ofType(IGRAC_TOGGLE_SYNC_WITH_GEOM)
        .switchMap(() => {
            const state = store.getState();
            const syncOn = igracSyncWithGeometries(state);
            const geometries = igracSelectWellGeometries(state);
            if (syncOn && geometries.length > 0) {
                return Observable.of(updateQuery({
                    updates: {
                        spatialField: buildSpatialField(geometries),
                        spatialFieldOperator: 'OR'
                    }
                }));
            }
            return Observable.of(updateQuery({ updates: { spatialField: null } }));
        });

const igracSyncGeomRefreshEpic = (action$, store) =>
    action$.ofType(IGRAC_SELECT_WELL_SET_GEOM, IGRAC_SELECT_WELL_REMOVE_GEOM, IGRAC_SELECT_WELL_CLEAR)
        .filter(() => igracSyncWithGeometries(store.getState()))
        .switchMap(() => {
            const geometries = igracSelectWellGeometries(store.getState());
            if (geometries.length === 0) {
                return Observable.of(updateQuery({ updates: { spatialField: null } }));
            }
            return Observable.of(updateQuery({
                updates: {
                    spatialField: buildSpatialField(geometries),
                    spatialFieldOperator: 'OR'
                }
            }));
        });

const igracSyncGeomCloseEpic = (action$, store) =>
    action$.ofType(CLOSE_FEATURE_GRID)
        .filter(() => igracSyncWithGeometries(store.getState()))
        .switchMap(() => Observable.of(toggleIgracSyncWithGeom()));

export default createPlugin('IgracSyncWithGeometries', {
    component: () => null,
    containers: {
        FeatureEditor: {
            name: 'IgracSyncWithGeometries',
            target: 'toolbar',
            Component: ConnectedButton,
            position: 1050,
            doNotHide: true
        }
    },
    epics: {
        igracSyncWithGeometriesEpic,
        igracSyncGeomRefreshEpic,
        igracSyncGeomCloseEpic
    }
});

