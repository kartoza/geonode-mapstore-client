/*
 * Equal Earth projection (EPSG:8857 and others using +proj=eqearth).
 *
 * MapStore uses @geosolutions/proj4 (2.4.9), which does not include the
 * Equal Earth projection (added to upstream proj4js in v2.6).
 * This module is ported from upstream proj4js lib/projections/eqearth.js,
 * with its common helpers inlined so it does not depend on proj4 internals.
 *
 * Copyright 2018 Bernie Jenny, Monash University, Melbourne, Australia.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Equal Earth is a projection inspired by the Robinson projection, but unlike
 * the Robinson projection retains the relative size of areas. The projection
 * was designed in 2018 by Bojan Savric, Tom Patterson and Bernhard Jenny.
 *
 * Publication:
 * Bojan Savric, Tom Patterson & Bernhard Jenny (2018). The Equal Earth map
 * projection, International Journal of Geographical Information Science,
 * DOI: 10.1080/13658816.2018.1504949
 */

const TWO_PI = Math.PI * 2;
// SPI is slightly greater than Math.PI, so values that exceed the -180..180
// degree range by a tiny amount don't get wrapped (same as proj4js).
const SPI = 3.14159265359;

const A1 = 1.340264;
const A2 = -0.081106;
const A3 = 0.000893;
const A4 = 0.003796;
const M = Math.sqrt(3) / 2.0;

const sign = (x) => x < 0 ? -1 : 1;

const adjustLon = (x) => (Math.abs(x) <= SPI) ? x : (x - (sign(x) * TWO_PI));

const qsfnz = (eccent, sinphi) => {
    if (eccent > 1.0e-7) {
        const con = eccent * sinphi;
        return ((1 - eccent * eccent) * (sinphi / (1 - con * con) - (0.5 / eccent) * Math.log((1 - con) / (1 + con))));
    }
    return (2 * sinphi);
};

const P00 = 0.33333333333333333333;
const P01 = 0.17222222222222222222;
const P02 = 0.10257936507936507936;
const P10 = 0.06388888888888888888;
const P11 = 0.06640211640211640211;
const P20 = 0.01641501294219154443;

const authset = (es) => {
    const APA = [];
    APA[0] = es * P00;
    let t = es * es;
    APA[0] += t * P01;
    APA[1] = t * P10;
    t *= es;
    APA[0] += t * P02;
    APA[1] += t * P11;
    APA[2] = t * P20;
    return APA;
};

const authlat = (beta, APA) => {
    const t = beta + beta;
    return (beta + APA[0] * Math.sin(t) + APA[1] * Math.sin(t + t) + APA[2] * Math.sin(t + t + t));
};

export function init() {
    // proj4 2.4.9 does not default these values (newer proj4 does)
    this.x0 = this.x0 || 0;
    this.y0 = this.y0 || 0;
    this.long0 = this.long0 || 0;
    if (this.es !== 0) {
        this.apa = authset(this.es);
        this.qp = qsfnz(this.e, 1);
        this.rqda = Math.sqrt(0.5 * this.qp);
    }
}

export function forward(p) {
    const lam = adjustLon(p.x - this.long0);
    const phi = p.y;
    let sinphi = Math.sin(phi);
    if (this.es !== 0) {
        sinphi = qsfnz(this.e, sinphi) / this.qp;
    }
    const paramLat = Math.asin(M * sinphi);
    const paramLatSq = paramLat * paramLat;
    const paramLatPow6 = paramLatSq * paramLatSq * paramLatSq;
    p.x = lam * Math.cos(paramLat)
        / (M * (A1 + 3 * A2 * paramLatSq + paramLatPow6 * (7 * A3 + 9 * A4 * paramLatSq)));
    p.y = paramLat * (A1 + A2 * paramLatSq + paramLatPow6 * (A3 + A4 * paramLatSq));

    if (this.es !== 0) {
        p.x *= this.rqda;
        p.y *= this.rqda;
    }

    p.x = this.a * p.x + this.x0;
    p.y = this.a * p.y + this.y0;
    return p;
}

export function inverse(p) {
    p.x = (p.x - this.x0) / this.a;
    p.y = (p.y - this.y0) / this.a;

    if (this.es !== 0) {
        p.x /= this.rqda;
        p.y /= this.rqda;
    }

    const EPS = 1e-9;
    const NITER = 12;
    let paramLat = p.y;
    let paramLatSq;
    let paramLatPow6;
    let fy;
    let fpy;
    let dlat;

    for (let i = 0; i < NITER; ++i) {
        paramLatSq = paramLat * paramLat;
        paramLatPow6 = paramLatSq * paramLatSq * paramLatSq;
        fy = paramLat * (A1 + A2 * paramLatSq + paramLatPow6 * (A3 + A4 * paramLatSq)) - p.y;
        fpy = A1 + 3 * A2 * paramLatSq + paramLatPow6 * (7 * A3 + 9 * A4 * paramLatSq);
        dlat = fy / fpy;
        paramLat -= dlat;
        if (Math.abs(dlat) < EPS) {
            break;
        }
    }
    // Clamp latitudes beyond the poles, and longitudes beyond ±180° from lon_0,
    // so they keep their hemisphere. The parametric latitude of the poles is asin(M).
    if (Math.abs(paramLat) > Math.PI / 3) {
        paramLat = sign(paramLat) * Math.PI / 3;
    }
    paramLatSq = paramLat * paramLat;
    paramLatPow6 = paramLatSq * paramLatSq * paramLatSq;
    p.x = M * p.x * (A1 + 3 * A2 * paramLatSq + paramLatPow6 * (7 * A3 + 9 * A4 * paramLatSq))
        / Math.cos(paramLat);
    if (Math.abs(p.x) > Math.PI) {
        p.x = sign(p.x) * Math.PI;
    }
    p.y = Math.asin(Math.sin(paramLat) / M);

    if (this.es !== 0) {
        p.y = authlat(p.y, this.apa);
    }

    p.x = adjustLon(p.x + this.long0);
    return p;
}

export const names = ['eqearth', 'Equal Earth', 'Equal_Earth'];

const eqearth = {
    init,
    forward,
    inverse,
    names
};

/**
 * Register the Equal Earth projection in the given proj4 instance,
 * only when it is not available yet.
 * It must run before any CRS using +proj=eqearth is used (e.g. before the map is created).
 * @param {object} proj4 proj4 instance
 */
export function registerEqualEarth(proj4) {
    const projections = proj4?.Proj?.projections;
    if (projections && !projections.get('eqearth')) {
        projections.add(eqearth);
    }
}

export default eqearth;
