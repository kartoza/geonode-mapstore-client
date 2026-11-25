/*
 * Patches for @geosolutions/proj4 (2.4.9), used by MapStore as `proj4`.
 */
import { registerEqualEarth } from '@js/utils/proj4/eqearth';

// projections of proj4 2.4.9 that can return null from forward/inverse
// (e.g. merc at the poles, laea/lcc/aea outside of their domain)
const NULLABLE_PROJECTIONS = ['merc', 'laea', 'lcc', 'aea', 'gauss', 'krovak'];

const toNaNPoint = (fn) => function nullSafe(p) {
    const result = fn.call(this, p);
    return result === null || result === undefined ? { x: NaN, y: NaN } : result;
};

/**
 * proj4 2.4.9 crashes with "Cannot read properties of null (reading 'x')"
 * when a projection returns null (e.g. transforming a pole to EPSG:3857).
 * Newer proj4 versions return { x: NaN, y: NaN } instead, which OpenLayers handles.
 * This happens when the map uses a projection that reaches the poles (e.g. EPSG:8857)
 * and OpenLayers reprojects EPSG:3857 tiles (e.g. OpenStreetMap) into it.
 * It must run before any proj4 Projection instance is created.
 * @param {object} proj4 proj4 instance
 */
export function patchNullTransforms(proj4) {
    const projections = proj4?.Proj?.projections;
    if (!projections) {
        return;
    }
    NULLABLE_PROJECTIONS.forEach((name) => {
        const projection = projections.get(name);
        if (projection && !projection.__nullSafePatched) {
            ['forward', 'inverse'].forEach((method) => {
                if (typeof projection[method] === 'function') {
                    projection[method] = toNaNPoint(projection[method]);
                }
            });
            projection.__nullSafePatched = true;
        }
    });
}

/**
 * Apply all the proj4 patches needed by the app.
 * @param {object} proj4 proj4 instance
 */
export function patchProj4(proj4) {
    registerEqualEarth(proj4);
    patchNullTransforms(proj4);
}

export default patchProj4;
