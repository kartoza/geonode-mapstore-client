import {
    setConfigProp
} from '@mapstore/framework/utils/ConfigUtils';
import axios from '@mapstore/framework/libs/ajax';


export function initIgracMapstore(mapConfig) {
    let layerAttributes = {};
    for (let _layer of mapConfig?.map?.layers) {
        if (_layer.id && (_layer?.style?.includes("groundwater:Groundwater_Well") || _layer?.name?.includes("groundwater:"))) {
            let layerName = _layer.name;
            _layer.isIgracLayer = true;
            setTimeout(function() {
                window.MapStoreAPI.triggerAction({ type: 'LAYERS:SELECT_NODE', id: _layer.id, nodeType: 'layer', ctrlKey: false});
            }, 500);
            layerName = 'groundwater:Groundwater_Well';
            let attributesUrl = `/api/layer/${layerName}/attributes`;
            axios.get(attributesUrl, {}).then((_response) => {
                layerAttributes[_layer.name] = _response.data;
            }).catch((error) => {
            }).finally(() => {
                setConfigProp('layerattributes', layerAttributes);
            });
        }
    }
}