export const isIgracSelectWellActive      = state => state?.igracSelectWell?.active ?? false;
export const igracSelectWellGeometryType  = state => state?.igracSelectWell?.geometryType ?? 'Polygon';
export const igracSelectWellGeometries    = state => state?.igracSelectWell?.filterGeometries ?? [];
export const hasIgracSelectWellGeometries = state => (state?.igracSelectWell?.filterGeometries ?? []).length > 0;
export const igracSelectWellData          = state => state?.igracSelectWell?.filterData ?? [];