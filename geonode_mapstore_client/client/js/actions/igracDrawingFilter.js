export const IGRAC_DRAWING_FILTER_ACTIVATE    = 'IGRAC:IGRAC_DRAWING_FILTER_ACTIVATE';
export const IGRAC_DRAWING_FILTER_DEACTIVATE  = 'IGRAC:IGRAC_DRAWING_FILTER_DEACTIVATE';
export const IGRAC_DRAWING_FILTER_SET_TYPE    = 'IGRAC:IGRAC_DRAWING_FILTER_SET_TYPE';
export const IGRAC_DRAWING_FILTER_SET_GEOM    = 'IGRAC:IGRAC_DRAWING_FILTER_SET_GEOM';
export const IGRAC_DRAWING_FILTER_REMOVE_GEOM = 'IGRAC:IGRAC_DRAWING_FILTER_REMOVE_GEOM';
export const IGRAC_DRAWING_FILTER_SET_DATA    = 'IGRAC:IGRAC_DRAWING_FILTER_SET_DATA';
export const IGRAC_DRAWING_FILTER_CLEAR       = 'IGRAC:IGRAC_DRAWING_FILTER_CLEAR';

export const activateIgracDrawingFilter      = ()                     => ({ type: IGRAC_DRAWING_FILTER_ACTIVATE });
export const deactivateIgracDrawingFilter    = ()                     => ({ type: IGRAC_DRAWING_FILTER_DEACTIVATE });
export const setIgracDrawingFilterType       = (geometryType)         => ({ type: IGRAC_DRAWING_FILTER_SET_TYPE, geometryType });
export const setIgracDrawingFilterGeom       = (geometry)             => ({ type: IGRAC_DRAWING_FILTER_SET_GEOM, geometry });
export const removeIgracDrawingFilterGeom    = (index)                => ({ type: IGRAC_DRAWING_FILTER_REMOVE_GEOM, index });
export const setIgracDrawingFilterData       = (index, features)      => ({ type: IGRAC_DRAWING_FILTER_SET_DATA, index, features });
export const clearIgracDrawingFilter         = ()                     => ({ type: IGRAC_DRAWING_FILTER_CLEAR });