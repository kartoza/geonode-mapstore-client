/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Rx from "rxjs";
import { _setThumbnail, updateMapLayoutEpic } from "@js/epics";

import { extendPluginsDefinition } from "@extend/jsapi/previewPlugins";

import MapPlugin from '@mapstore/framework/plugins/Map';
import IdentifyPlugin from '@mapstore/framework/plugins/Identify';
import ToolbarPlugin from '@mapstore/framework/plugins/Toolbar';
import ZoomAllPlugin from '@mapstore/framework/plugins/ZoomAll';
import MapLoadingPlugin from '@mapstore/framework/plugins/MapLoading';
import OmniBarPlugin from '@mapstore/framework/plugins/OmniBar';
import BackgroundSelectorPlugin from '@mapstore/framework/plugins/BackgroundSelector';
import FullScreenPlugin from '@mapstore/framework/plugins/FullScreen';
import ZoomInPlugin from '@mapstore/framework/plugins/ZoomIn';
import ZoomOutPlugin from '@mapstore/framework/plugins/ZoomOut';
import ExpanderPlugin from '@mapstore/framework/plugins/Expander';
import BurgerMenuPlugin from '@mapstore/framework/plugins/BurgerMenu';
import ScaleBoxPlugin from '@mapstore/framework/plugins/ScaleBox';
import MapFooterPlugin from '@mapstore/framework/plugins/MapFooter';
import PrintPlugin from '@mapstore/framework/plugins/Print';
import TimelinePlugin from '@mapstore/framework/plugins/Timeline';
import PlaybackPlugin from '@mapstore/framework/plugins/Playback';

import security from '@mapstore/framework/reducers/security';
import maps from '@mapstore/framework/reducers/maps';
import maplayout from '@mapstore/framework/reducers/maplayout';


import ReactSwipe from 'react-swipeable-views';
import SwipeHeader from '@mapstore/framework/components/data/identify/SwipeHeader';


const pluginsDefinition = {
    plugins: {
        MapPlugin,
        IdentifyPlugin,
        ToolbarPlugin,
        ZoomAllPlugin,
        MapLoadingPlugin,
        OmniBarPlugin,
        BackgroundSelectorPlugin,
        FullScreenPlugin,
        ZoomInPlugin,
        ZoomOutPlugin,
        ExpanderPlugin,
        BurgerMenuPlugin,
        ScaleBoxPlugin,
        MapFooterPlugin,
        PrintPlugin,
        TimelinePlugin,
        PlaybackPlugin,
        AddReducersAndEpics: {
            reducers: {
                security,
                maps,
                maplayout
            },
            epics: {
                _setThumbnail,
                updateMapLayoutEpic,
                zoomToVisibleAreaEpic: () => Rx.Observable.empty()
            }
        }
    },
    requires: {
        ReactSwipe,
        SwipeHeader
    }
};

const extendedPluginsDefinition = extendPluginsDefinition
    ? extendPluginsDefinition(pluginsDefinition)
    : pluginsDefinition;

export default extendedPluginsDefinition;
