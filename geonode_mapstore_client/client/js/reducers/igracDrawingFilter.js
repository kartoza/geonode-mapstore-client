import {
    IGRAC_DRAWING_FILTER_ACTIVATE,
    IGRAC_DRAWING_FILTER_DEACTIVATE,
    IGRAC_DRAWING_FILTER_SET_TYPE,
    IGRAC_DRAWING_FILTER_SET_GEOM,
    IGRAC_DRAWING_FILTER_REMOVE_GEOM,
    IGRAC_DRAWING_FILTER_SET_DATA,
    IGRAC_DRAWING_FILTER_CLEAR
} from '@js/actions/igracDrawingFilter';

const initialState = {
    active: false,
    geometryType: 'Polygon',
    filterGeometries: [],
    filterData: [] // parallel to filterGeometries: null = loading, array = loaded
};

export default function igracDrawingFilter(state = initialState, action) {
    switch (action.type) {
    case IGRAC_DRAWING_FILTER_ACTIVATE:
        return { ...state, active: true };
    case IGRAC_DRAWING_FILTER_DEACTIVATE:
        return { ...state, active: false };
    case IGRAC_DRAWING_FILTER_SET_TYPE:
        return { ...state, geometryType: action.geometryType };
    case IGRAC_DRAWING_FILTER_SET_GEOM:
        return {
            ...state,
            filterGeometries: [...state.filterGeometries, action.geometry],
            filterData: [...state.filterData, null]
        };
    case IGRAC_DRAWING_FILTER_REMOVE_GEOM:
        return {
            ...state,
            filterGeometries: state.filterGeometries.filter((_, i) => i !== action.index),
            filterData: state.filterData.filter((_, i) => i !== action.index)
        };
    case IGRAC_DRAWING_FILTER_SET_DATA:
        return {
            ...state,
            filterData: state.filterData.map((d, i) => i === action.index ? action.features : d)
        };
    case IGRAC_DRAWING_FILTER_CLEAR:
        return { ...initialState };
    default:
        return state;
    }
}