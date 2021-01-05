/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

function toLazyPlugin(name, imp) {
    return imp.then((mod) => {
        const impl = mod.default;
        const pluginName = name + 'Plugin';
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
    SharePlugin: () => toLazyPlugin(
        'Share',
        import(/* webpackChunkName: 'plugins/share-plugin' */ '@js/plugins/Share')
    ),
    GeonodeMetadataPlugin: () => toLazyPlugin(
        'GeonodeMetadata',
        import(/* webpackChunkName: 'plugins/metadata-plugin' */ '@js/plugins/GeonodeMetadata')
    ),
    IgracDownloadPlugin: () => toLazyPlugin(
        'IgracDownload',
        import(/* webpackChunkName: 'plugins/metadata-plugin' */ '@js/plugins/IgracDownload')
    )
};

export default plugins;
