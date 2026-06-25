export const IGRAC_SELECT_WELL_ACTIVATE    = 'IGRAC:IGRAC_SELECT_WELL_ACTIVATE';
export const IGRAC_SELECT_WELL_DEACTIVATE  = 'IGRAC:IGRAC_SELECT_WELL_DEACTIVATE';
export const IGRAC_SELECT_WELL_SET_TYPE    = 'IGRAC:IGRAC_SELECT_WELL_SET_TYPE';
export const IGRAC_SELECT_WELL_SET_GEOM    = 'IGRAC:IGRAC_SELECT_WELL_SET_GEOM';
export const IGRAC_SELECT_WELL_REMOVE_GEOM = 'IGRAC:IGRAC_SELECT_WELL_REMOVE_GEOM';
export const IGRAC_SELECT_WELL_SET_DATA     = 'IGRAC:IGRAC_SELECT_WELL_SET_DATA';
export const IGRAC_SELECT_WELL_SET_PROGRESS = 'IGRAC:IGRAC_SELECT_WELL_SET_PROGRESS';
export const IGRAC_SELECT_WELL_CLEAR       = 'IGRAC:IGRAC_SELECT_WELL_CLEAR';
export const IGRAC_TOGGLE_SYNC_WITH_GEOM   = 'IGRAC:TOGGLE_SYNC_WITH_GEOM';

export const activateIgracSelectWell      = ()                     => ({ type: IGRAC_SELECT_WELL_ACTIVATE });
export const deactivateIgracSelectWell    = ()                     => ({ type: IGRAC_SELECT_WELL_DEACTIVATE });
export const setIgracSelectWellType       = (geometryType)         => ({ type: IGRAC_SELECT_WELL_SET_TYPE, geometryType });
export const setIgracSelectWellGeom       = (geometry)             => ({ type: IGRAC_SELECT_WELL_SET_GEOM, geometry });
export const removeIgracSelectWellGeom    = (index)                => ({ type: IGRAC_SELECT_WELL_REMOVE_GEOM, index });
export const setIgracSelectWellData       = (index, features)      => ({ type: IGRAC_SELECT_WELL_SET_DATA, index, features });
export const setIgracSelectWellProgress   = (index, features, total) => ({ type: IGRAC_SELECT_WELL_SET_PROGRESS, index, features, total });
export const clearIgracSelectWell         = ()                     => ({ type: IGRAC_SELECT_WELL_CLEAR });
export const toggleIgracSyncWithGeom      = ()                     => ({ type: IGRAC_TOGGLE_SYNC_WITH_GEOM });