/** Base configuration for map and layer preview These are maps are shown embedded in geonode */
var MS2_BASE_PLUGINS = {
	"desktop": [{
			"name": "Map",
			"cfg": {
				"tools": ["locate", "measurement", "draw", "box"],
				"mapOptions": {
					"openlayers": {
						"attribution": {
							"container": "#footer-attribution-container"
						},
						"interactions": {
							"pinchRotate": false,
							"altShiftDragRotate": false
						}
					}
				},
				"toolsOptions": {
					"locate": {
						// "maxZoom": 5 use a custom max zoom
					}
				}
			}
		},
		{
			"name": "BackgroundSelector",
			"cfg": {
				"style": {
					"bottom": 0,
					"marginBottom": 25
				},
				"dimensions": {
					"side": 65,
					"sidePreview": 65,
					"frame": 3,
					"margin": 5,
					"label": false,
					"vertical": true,
				}
			}
		},
		{
			"name": "Identify",
			"cfg": {
				"showFullscreen": false,
				"dock": true,
				"position": "right",
				"size": 0.4,
				"fluid": true,
				"viewerOptions": {
					"container": "{context.ReactSwipe}"
				}
			},
			"override": {
				"Toolbar": {
					"position": 11,
					"alwaysVisible": false
				}
			}
		},
		{
			"name": "TOC",
			"cfg": {
				"activateMapTitle": false,
				"activateMetedataTool": false,
				"activateRemoveLayer": false,
				"activateAddGroupButton": true
			}

		},
		{
			"name": "Settings",
			"cfg": {
				"wrap": true
			}
		}, {
			"name": "Toolbar",
			"id": "NavigationBar",
			"cfg": {
				"id": "navigationBar",
				"layout": "horizontal"
			}
		}, {
			"name": "MapLoading",
			"override": {
				"Toolbar": {
					"alwaysVisible": true
				}
			}
		},
		{
			"name": "DrawerMenu",
			"cfg": {
				"show": true
			}
		},
		"Cookie",
		"OmniBar",
		"Expander",
		"Undo",
		"Redo",
		"BurgerMenu",
		"MapFooter",
		"Measure",
		"Annotations",
		"Share",
		"AddGroup",
		"GeonodeMetadata",
		"IgracDownload",
		{
			"name": "CRSSelector",
			"cfg": {
				"filterAllowedCRS": [
					"EPSG:4326",
					"EPSG:3857"
				],
			}
		},
		{
			"name": "Tutorial",
			"cfg": {
				"presetList": {
					"default_tutorial": [
						{
							"selector": "#map-search-bar",
							"title": "Search Bar",
							"text": "Write the address of a place to find. e.g. '1st avenue, new york'. " +
								"You can even insert coordinates in this format: 43.87,10.20",
						},
						{
							"selector": "#zoomin-btn",
							"title": "Zoom In",
							"text": "Click to enlarge the map",
						},
						{
							"selector": "#zoomout-btn",
							"title": "Zoom Out",
							"text": "Click to reduce the map",
						},
						{
							"selector": ".glyphicon-add-layer",
							"title": "Add Layer",
							"text": "Browse services (WMS/WMTS/CSW) to add layers to the map",
						},
						{
							"selector": ".glyphicon-add-folder",
							"title": "Add Layer Group",
							"text": "Allows users to create new layer groups in the TOC",
						}
					]
				}
			}
		},
		{
			"name": "Print",
			"cfg": {
				"disablePluginIf": "{state('mapType') === 'cesium'}",
				"useFixedScales": true,
				"mapWidth": 256
			}
		},
		{
			"name": "ZoomAll",
			"override": {
				"Toolbar": {
					"alwaysVisible": false
				}
			}
		},
		{
			"name": "ZoomIn",
			"override": {
				"Toolbar": {
					"alwaysVisible": true
				}
			}
		},
		{
			"name": "ZoomOut",
			"override": {
				"Toolbar": {
					"alwaysVisible": true
				}
			}
		}, {
			"name": "Timeline",
			"cfg": {
				"style": {
					"marginBottom": 30,
					"marginLeft": 80,
					"marginRight": 45
				},
				"compact": true
			}
		}, "Playback",
		{ "name": "LayerDownload" }
	]
}
