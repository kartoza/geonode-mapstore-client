import {
    setConfigProp
} from '@mapstore/framework/utils/ConfigUtils';
import axios from '@mapstore/framework/libs/ajax';


export function initIgracMapstore() {
    const uuidUrl = '/groundwater/user/uuid/';
    const currentUrl = window.location.href;
    let layerAttributes = {};

    if (currentUrl.includes('groundwater-well') || currentUrl.includes('well-and-monitoring-data') || currentUrl.includes('view/ggmn')) {
        axios.get(uuidUrl, {}).then((response) => {
            const viewParams = `uuid:${response.data['uuid']}`;
            setConfigProp('viewparams', viewParams);
            const layers = window.__GEONODE_CONFIG__.resourceConfig.map.layers || [];
            if (response.data['extent']) {
                setTimeout(function() {
                    const extent = response.data['extent'];
                    window.MapStoreAPI.triggerAction({
                        type: 'ZOOM_TO_EXTENT',
                        extent: {
                            minx: extent[0],
                            miny: extent[1],
                            maxx: extent[2],
                            maxy: extent[3]
                        },
                        crs: 'EPSG:4326',
                        padding: {
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0
                        }
                    });
                    // Find groundwater layer
                    for (let i = 0; i < layers.length; i++) {
                        try {
                            const layer = layers[i];
                            if (layer.id.toLowerCase().includes('groundwater_well')) {
                                window.MapStoreAPI.triggerAction({ type: 'LAYERS:SELECT_NODE', id: layer.id, nodeType: 'layer', ctrlKey: false});
                            }
                        } catch (e) {
                        }
                    }
                }, 3000);
            }
            for (let _layer of layers) {
                if (!_layer.id || !_layer.id.toLowerCase().includes('groundwater_well')) {
                    continue;
                }
                let layerName = _layer.name;
                layerName = layerName.replace('groundwater:Groundwater_Well_GGMN', 'groundwater:Groundwater_Well');
                let attributesUrl = `/api/layer/${layerName}/attributes`;
                axios.get(attributesUrl, {}).then((_response) => {
                    layerAttributes[_layer.name] = _response.data;
                }).catch((error) => {
                }).finally(() => {
                    setConfigProp('layerattributes', layerAttributes);
                });
            }
        });
    }
}
