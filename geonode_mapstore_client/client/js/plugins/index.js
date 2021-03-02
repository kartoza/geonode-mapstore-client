/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isFunction from 'lodash/isFunction';

function toLazyPlugin(name, imp) {
    return imp.then((mod) => {
        const impl = mod.default;
        const pluginName = name + 'Plugin';
        if (!isFunction(impl[pluginName])) {
            const {
                enabler,
                loadPlugin,
                disablePluginIf,
                ...containers
            } = impl[pluginName];
            return {
                'default': {
                    name,
                    component: impl[pluginName],
                    reducers: impl.reducers || {},
                    epics: impl.epics || {},
                    containers,
                    disablePluginIf,
                    enabler,
                    loadPlugin
                }
            };
        }
        return {
            'default': {
                name,
                component: impl[pluginName],
                reducers: impl.reducers || {},
                epics: impl.epics || {},
                containers: impl.containers || {}
            }
        };
    });
}

// this plugins index combined with the hook `useLazyPlugins`
// provides a way to import dynamically plugins similar to extensions

const plugins = {
    OmniBarPlugin: () => toLazyPlugin(
        'OmniBar',
        import(/* webpackChunkName: 'plugins/omni-bar-plugin' */ '@mapstore/framework/plugins/OmniBar')
    ),
    BurgerMenuPlugin: () => toLazyPlugin(
        'BurgerMenu',
        import(/* webpackChunkName: 'plugins/burger-menu-plugin' */ '@mapstore/framework/plugins/BurgerMenu')
    ),
    GeoStoryPlugin: () => toLazyPlugin(
        'GeoStory',
        import(/* webpackChunkName: 'plugins/geostory-plugin' */ '@mapstore/framework/plugins/GeoStory')
    ),
    MapPlugin: () => toLazyPlugin(
        'Map',
        import(/* webpackChunkName: 'plugins/map-plugin' */ '@mapstore/framework/plugins/Map')
    ),
    MediaEditorPlugin: () => toLazyPlugin(
        'MediaEditor',
        import(/* webpackChunkName: 'plugins/media-editor-plugin' */ '@mapstore/framework/plugins/MediaEditor')
    ),
    GeoStoryEditorPlugin: () => toLazyPlugin(
        'GeoStoryEditor',
        import(/* webpackChunkName: 'plugins/geostory-editor-plugin' */ '@mapstore/framework/plugins/GeoStoryEditor')
    ),
    GeoStoryNavigationPlugin: () => toLazyPlugin(
        'GeoStoryNavigation',
        import(/* webpackChunkName: 'plugins/geostory-navigation-plugin' */ '@mapstore/framework/plugins/GeoStoryNavigation')
    ),
    NotificationsPlugin: () => toLazyPlugin(
        'Notifications',
        import(/* webpackChunkName: 'plugins/notifications-plugin' */ '@mapstore/framework/plugins/Notifications')
    ),
    SavePlugin: () => toLazyPlugin(
        'Save',
        import(/* webpackChunkName: 'plugins/save-plugin' */ '@js/plugins/Save')
    ),
    SaveAsPlugin: () => toLazyPlugin(
        'SaveAs',
        import(/* webpackChunkName: 'plugins/save-as-plugin' */ '@js/plugins/SaveAs')
    ),
    SearchPlugin: () => toLazyPlugin(
        'Search',
        import(/* webpackChunkName: 'plugins/search-plugin' */ '@mapstore/framework/plugins/Search')
    ),
    SharePlugin: () => toLazyPlugin(
        'Share',
        import(/* webpackChunkName: 'plugins/share-plugin' */ '@js/plugins/Share')
    ),
    IdentifyPlugin: () => toLazyPlugin(
        'Identify',
        import(/* webpackChunkName: 'plugins/identify-plugin' */ '@mapstore/framework/plugins/Identify')
    ),
    ToolbarPlugin: () => toLazyPlugin(
        'Toolbar',
        import(/* webpackChunkName: 'plugins/toolbar-plugin' */ '@mapstore/framework/plugins/Toolbar')
    ),
    ZoomAllPlugin: () => toLazyPlugin(
        'ZoomAll',
        import(/* webpackChunkName: 'plugins/zoom-all-plugin' */ '@mapstore/framework/plugins/ZoomAll')
    ),
    MapLoadingPlugin: () => toLazyPlugin(
        'MapLoading',
        import(/* webpackChunkName: 'plugins/map-loading-plugin' */ '@mapstore/framework/plugins/MapLoading')
    ),
    BackgroundSelectorPlugin: () => toLazyPlugin(
        'BackgroundSelector',
        import(/* webpackChunkName: 'plugins/background-selector-plugin' */ '@mapstore/framework/plugins/BackgroundSelector')
    ),
    ZoomInPlugin: () => toLazyPlugin(
        'ZoomIn',
        import(/* webpackChunkName: 'plugins/zoom-in-plugin' */ '@mapstore/framework/plugins/ZoomIn')
    ),
    ZoomOutPlugin: () => toLazyPlugin(
        'ZoomOut',
        import(/* webpackChunkName: 'plugins/zoom-out-plugin' */ '@mapstore/framework/plugins/ZoomOut')
    ),
    ExpanderPlugin: () => toLazyPlugin(
        'Expander',
        import(/* webpackChunkName: 'plugins/expander-plugin' */ '@mapstore/framework/plugins/Expander')
    ),
    ScaleBoxPlugin: () => toLazyPlugin(
        'ScaleBox',
        import(/* webpackChunkName: 'plugins/scale-box-plugin' */ '@mapstore/framework/plugins/ScaleBox')
    ),
    MapFooterPlugin: () => toLazyPlugin(
        'MapFooter',
        import(/* webpackChunkName: 'plugins/map-footer-plugin' */ '@mapstore/framework/plugins/MapFooter')
    ),
    PrintPlugin: () => toLazyPlugin(
        'Print',
        import(/* webpackChunkName: 'plugins/print-plugin' */ '@mapstore/framework/plugins/Print')
    ),
    TimelinePlugin: () => toLazyPlugin(
        'Timeline',
        import(/* webpackChunkName: 'plugins/timeline-plugin' */ '@mapstore/framework/plugins/Timeline')
    ),
    PlaybackPlugin: () => toLazyPlugin(
        'Playback',
        import(/* webpackChunkName: 'plugins/playback-plugin' */ '@mapstore/framework/plugins/Playback')
    ),
    LocatePlugin: () => toLazyPlugin(
        'Locate',
        import(/* webpackChunkName: 'plugins/locate-plugin' */ '@mapstore/framework/plugins/Locate')
    ),
    TOCPlugin: () => toLazyPlugin(
        'TOC',
        import(/* webpackChunkName: 'plugins/toc-plugin' */ '@mapstore/framework/plugins/TOC')
    ),
    DrawerMenuPlugin: () => toLazyPlugin(
        'DrawerMenu',
        import(/* webpackChunkName: 'plugins/drawer-menu-plugin' */ '@mapstore/framework/plugins/DrawerMenu')
    )
};

export default plugins;
