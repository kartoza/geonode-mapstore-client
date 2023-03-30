import {
    setConfigProp
} from '@mapstore/framework/utils/ConfigUtils';
import axios from '@mapstore/framework/libs/ajax';


export function initIgracMapstore(mapConfig) {
    let layerAttributes = {};
    console.log('mapLayers', mapConfig);
    for (let _layer of mapConfig?.map?.layers) {
        if (_layer.id && _layer.name.toLowerCase().includes('groundwater_well')) {
            let layerName = _layer.name;
            setTimeout(function() {
                window.MapStoreAPI.triggerAction({ type: 'LAYERS:SELECT_NODE', id: _layer.id, nodeType: 'layer', ctrlKey: false});
            }, 500);
            layerName = layerName.replace('groundwater:Groundwater_Well_GGMN', 'groundwater:Groundwater_Well');
            let attributesUrl = `/api/layer/${layerName}/attributes`;
            axios.get(attributesUrl, {}).then((_response) => {
                layerAttributes[_layer.name] = _response.data;
            }).catch((error) => {
            }).finally(() => {
                setConfigProp('layerattributes', layerAttributes);
            });
            break;
        }
    }
}
