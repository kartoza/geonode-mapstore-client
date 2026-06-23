import {
    IGRAC_SELECT_WELL_ACTIVATE,
    IGRAC_SELECT_WELL_DEACTIVATE,
    IGRAC_SELECT_WELL_SET_TYPE,
    IGRAC_SELECT_WELL_SET_GEOM,
    IGRAC_SELECT_WELL_REMOVE_GEOM,
    IGRAC_SELECT_WELL_SET_DATA,
    IGRAC_SELECT_WELL_CLEAR
} from '@js/actions/igracSelectWell';

const initialState = {
    active: false,
    geometryType: 'Polygon',
    filterGeometries: [],
    filterData: [] // parallel to filterGeometries: null = loading, array = loaded
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
            filterGeometries: [...state.filterGeometries, action.geometry],
            filterData: [...state.filterData, null]
        };
    case IGRAC_SELECT_WELL_REMOVE_GEOM:
        return {
            ...state,
            filterGeometries: state.filterGeometries.filter((_, i) => i !== action.index),
            filterData: state.filterData.filter((_, i) => i !== action.index)
        };
    case IGRAC_SELECT_WELL_SET_DATA:
        return {
            ...state,
            filterData: state.filterData.map((d, i) => i === action.index ? action.features : d)
        };
    case IGRAC_SELECT_WELL_CLEAR:
        return { ...initialState };
    default:
        return state;
    }
}