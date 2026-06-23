import {
    IGRAC_SELECT_WELL_ACTIVATE,
    IGRAC_SELECT_WELL_DEACTIVATE,
    IGRAC_SELECT_WELL_SET_TYPE,
    IGRAC_SELECT_WELL_SET_GEOM,
    IGRAC_SELECT_WELL_REMOVE_GEOM,
    IGRAC_SELECT_WELL_SET_DATA,
    IGRAC_SELECT_WELL_SET_PROGRESS,
    IGRAC_SELECT_WELL_CLEAR,
    IGRAC_TOGGLE_SYNC_WITH_GEOM
} from '@js/actions/igracSelectWell';

const initialState = {
    active: false,
    geometryType: 'Polygon',
    geometries: [],
    data: [],
    syncGeometries: false
};

export default function igracSelectWell(state = initialState, action) {
    switch (action.type) {
    case IGRAC_SELECT_WELL_ACTIVATE:
        return { ...state, active: true };
    case IGRAC_SELECT_WELL_DEACTIVATE:
        return { ...state, active: false };
    case IGRAC_SELECT_WELL_SET_TYPE:
        return { ...state, geometryType: action.geometryType };
    case IGRAC_SELECT_WELL_SET_GEOM:
        return {
            ...state,
            geometries: [...state.geometries, action.geometry],
            data: [...state.data, null]
        };
    case IGRAC_SELECT_WELL_REMOVE_GEOM:
        return {
            ...state,
            geometries: state.geometries.filter((_, i) => i !== action.index),
            data: state.data.filter((_, i) => i !== action.index)
        };
    case IGRAC_SELECT_WELL_SET_PROGRESS:
        return {
            ...state,
            data: state.data.map((d, i) => i === action.index
                ? { loading: true, features: action.features, total: action.total }
                : d)
        };
    case IGRAC_SELECT_WELL_SET_DATA:
        return {
            ...state,
            data: state.data.map((d, i) => i === action.index ? action.features : d)
        };
    case IGRAC_SELECT_WELL_CLEAR:
        return { ...initialState };
    case IGRAC_TOGGLE_SYNC_WITH_GEOM:
        return { ...state, syncGeometries: !state.syncGeometries };
    default:
        return state;
    }
}
