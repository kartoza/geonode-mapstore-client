import React, { useState, useEffect, useRef, useMemo } from 'react';
import { template } from 'lodash';
import { Glyphicon, FormControl } from 'react-bootstrap';
import { getCleanTemplate } from '@mapstore/framework/utils/TemplateUtils';
import HtmlRenderer from '@mapstore/framework/components/misc/HtmlRenderer';
import Button from '@js/components/Button';
import tooltip from '@mapstore/framework/components/misc/enhancers/tooltip';

const TooltipButton = tooltip(Button);

function downloadFeatures(features) {
    const seen = new Set();
    const unique = features.filter(f => {
        const key = f.id ?? JSON.stringify(f.properties);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    const blob = new Blob(
        [JSON.stringify({ type: 'FeatureCollection', features: unique }, null, 2)],
        { type: 'application/json' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'groundwater_wells.geojson';
    a.click();
    URL.revokeObjectURL(a.href);
}

function GroundwaterViewer({ layer = {}, response }) {
    const allFeatures = response?.features || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [search, setSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const sorted = useMemo(() =>
        [...allFeatures].sort((a, b) => {
            const idA = String(a.properties?.original_id ?? '');
            const idB = String(b.properties?.original_id ?? '');
            return idA.localeCompare(idB);
        }),
    [allFeatures]);

    useEffect(() => {
        setCurrentIndex(0);
        setSearch('');
        setShowSuggestions(false);
    }, [response]);

    useEffect(() => {
        function handleClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    if (sorted.length === 0) {
        return null;
    }

    const trimmed = search.trim().toLowerCase();
    const suggestions = trimmed
        ? sorted.filter(f =>
            String(f.properties?.original_id ?? '').toLowerCase().includes(trimmed)
        )
        : [];

    const filtered = trimmed ? suggestions : sorted;

    const safeIndex = Math.min(currentIndex, Math.max(0, filtered.length - 1));
    const feature = filtered[safeIndex];

    let html = '';
    if (feature) {
        const tmpl = layer.featureInfo?.template || '';
        try {
            const clean = getCleanTemplate(tmpl, feature, /\$\{.*?\}/g, 2, 1);
            html = template(clean)(feature);
        } catch (e) {
            html = '<p>Error rendering template</p>';
        }
    }

    function selectSuggestion(f) {
        const idx = filtered.indexOf(f);
        setSearch(String(f.properties?.original_id ?? ''));
        setCurrentIndex(idx >= 0 ? idx : 0);
        setShowSuggestions(false);
    }

    function goTo(index) {
        setCurrentIndex(Math.max(0, Math.min(index, filtered.length - 1)));
    }

    return (
        <div>
            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', fontSize: 12, marginTop: 4 }}>
                <Button variant="default" size="xs" disabled={safeIndex === 0} onClick={() => goTo(safeIndex - 1)}>
                    <Glyphicon glyph="chevron-left" />
                </Button>
                <span>
                    {filtered.length === 0 ? 0 : safeIndex + 1} of {filtered.length}
                    {trimmed && <em style={{ color: '#999', marginLeft: 4 }}>(filtered from {sorted.length})</em>}
                </span>
                <Button variant="default" size="xs" disabled={safeIndex === filtered.length - 1} onClick={() => goTo(safeIndex + 1)}>
                    <Glyphicon glyph="chevron-right" />
                </Button>
            </div>

            {/* Search + Download */}
            <div style={{ paddingLeft: '8px', paddingRight: '8px', display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8, marginTop: 4 }} ref={containerRef}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Glyphicon
                        glyph="search"
                        style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: 11, zIndex: 1 }}
                    />
                    <FormControl
                        inputRef={r => { inputRef.current = r; }}
                        type="text"
                        value={search}
                        placeholder="Search by original ID..."
                        onChange={e => { setSearch(e.target.value); setCurrentIndex(0); setShowSuggestions(true); }}
                        onFocus={() => setShowSuggestions(true)}
                        style={{ paddingLeft: 26, paddingRight: search ? 26 : 8, fontSize: 12, height: 28, borderRadius: 0 }}
                    />
                    {search && (
                        <Glyphicon
                            glyph="remove"
                            onClick={() => { setSearch(''); setCurrentIndex(0); setShowSuggestions(false); inputRef.current?.focus(); }}
                            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#999', cursor: 'pointer', fontSize: 11 }}
                        />
                    )}
                    {showSuggestions && suggestions.length > 0 && (
                        <ul style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
                            background: '#fff', border: '1px solid #ccc', borderTop: 'none',
                            margin: 0, padding: 0, listStyle: 'none',
                            maxHeight: 180, overflowY: 'auto', boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                        }}>
                            {suggestions.slice(0, 50).map((f, i) => (
                                <li
                                    key={i}
                                    onMouseDown={() => selectSuggestion(f)}
                                    style={{ padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                                >
                                    {f.properties?.original_id}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <style>{'.igrac-dl-btn:hover:not([disabled]){opacity:0.9}'}</style>
                <TooltipButton
                    tooltip={`Download ${sorted.length} wells`}
                    tooltipPosition="bottom"
                    variant="primary"
                    size="xs"
                    disabled={sorted.length === 0 || downloading}
                    onClick={() => {
                        setDownloading(true);
                        const formData = new FormData();
                        sorted.forEach(f => formData.append('wells_id', f.properties.id));
                        formData.append('data_type', 'Well and Monitoring Data');
                        fetch('/groundwater/record/download/by-ids/initiate', {
                            method: 'POST',
                            body: formData
                        }).then(res => {
                            if (res.ok) {
                                window.open(res.url, '_blank');
                            } else {
                                res.text().then(msg => alert(`Download failed (${res.status}): ${msg}`));
                            }
                        }).catch(err => alert(`Download error: ${err.message}`))
                            .finally(() => setDownloading(false));
                    }}
                    className="igrac-dl-btn"
                    style={{ backgroundColor: 'var(--secondary)', color: '#fff', padding: '4px 8px' }}
                >
                    <Glyphicon glyph={downloading ? 'refresh' : 'download-alt'} className={downloading ? 'igrac-spin' : ''} />
                </TooltipButton>
                {downloading && <style>{'.igrac-spin{height: 15px; width: 13px;animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'}</style>}
            </div>

            {/* Content */}
            {filtered.length === 0 ? (
                <div style={{ padding: '12px 8px', fontSize: 12, color: '#999', textAlign: 'center' }}>
                    No results for &ldquo;{search}&rdquo;
                </div>
            ) : (
                <div style={{ padding: '4px' }}>
                    <HtmlRenderer html={html} />
                </div>
            )}
        </div>
    );
}

export default GroundwaterViewer;