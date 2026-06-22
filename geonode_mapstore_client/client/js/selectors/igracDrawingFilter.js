export const isIgracDrawingFilterActive      = state => state?.igracDrawingFilter?.active ?? false;
export const igracDrawingFilterGeometryType  = state => state?.igracDrawingFilter?.geometryType ?? 'Polygon';
export const igracDrawingFilterGeometries    = state => state?.igracDrawingFilter?.filterGeometries ?? [];
export const hasIgracDrawingFilterGeometries = state => (state?.igracDrawingFilter?.filterGeometries ?? []).length > 0;