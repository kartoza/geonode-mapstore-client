export const isIgracSelectWellActive      = state => state?.igracSelectWell?.active ?? false;
export const igracSelectWellGeometryType  = state => state?.igracSelectWell?.geometryType ?? 'Polygon';
export const igracSelectWellGeometries    = state => state?.igracSelectWell?.geometries ?? [];
export const hasIgracSelectWellGeometries = state => (state?.igracSelectWell?.geometries ?? []).length > 0;
export const igracSelectWellData          = state => state?.igracSelectWell?.data ?? [];
export const igracSyncWithGeometries      = state => state?.igracSelectWell?.syncGeometries ?? false;