# GeoNode MapStore Client Project

This directory is the root folder where to initialize all the npm scripts. See the main [README.md](../../README.md) for more information about this directory.

This project contains following applications:

- [MapStore js API](#mapStore-js-api)
- [GeoStory](#geostory)
- [Homepage](#homepage)

## MapStore js API
Api used inside django templates to show map and layer viewers

## GeoStory
This application allow to show and edit stories with map and geospatial data
## Homepage

This single application is an alternative homepage that interact with the GeoNode API v2 and shows available resources. You can enable this app by replacing the content of the index.html of a GeoNode project with the [home.html](home.html) template.

The homepage configuration file is located in [localConfig.json](static/mapstore/configs/localConfig.json) and it exposes specific properties to customize the homepage theme and structure:

- @prop {object} `geoNodeApi`
- @prop {object} `supportedLocales`
- @prop {object} `geoNodeConfiguration` general configuration of the homepage app
- @prop {object} geoNodeConfiguration.`theme` general theme configuration of the homepage app
  - @prop {string} geoNodeConfiguration.`theme.variant` "light" or "dark"
  - @prop {string} geoNodeConfiguration.`theme.color` main theme color (menu index)
  - @prop {object} geoNodeConfiguration.`theme.navbar` navbar theme properties
  - @prop {object} geoNodeConfiguration.`theme.navbar.style` a css style object to apply on the navbar container node
  - @prop {object} geoNodeConfiguration.`theme.hero` hero image theme properties
  - @prop {object} geoNodeConfiguration.`theme.hero.style` a css style object to apply on the hero image container node, use backgroundImage css property to apply a background image
  - @prop {object} geoNodeConfiguration.`theme.jumbotron` jumbotron text content theme properties
  - @prop {object} geoNodeConfiguration.`theme.jumbotron.style` a css style object to apply on the jumbotron container node
  - @prop {object} geoNodeConfiguration.`theme.languageSelector` language selector theme properties
  - @prop {boolean} geoNodeConfiguration.`theme.languageSelector.inline` shows languages as inline text if true, default false shows a dropdown
  - @prop {object} geoNodeConfiguration.`theme.footer` footer theme properties
  - @prop {string} geoNodeConfiguration.`theme.footer.color` footer text color (css variable --gn-footer-color)
  - @prop {string} geoNodeConfiguration.`theme.footer.bg` footer background color (css variable --gn-footer-bg)
  - @prop {object} geoNodeConfiguration.`theme.footer.link` theme for footer link
  - @prop {string} geoNodeConfiguration.`theme.footer.link.color` footer link text color (css variable --gn-footer-link-color)
  - @prop {string} geoNodeConfiguration.`theme.footer.link.hoverColor` footer link text color on hover (css variable --gn-footer-link-hover-color)
  - @prop {object} geoNodeConfiguration.`theme.footer.style` a css style object to apply on the footer container node
- @prop {object} geoNodeConfiguration.`filters` configuration of filter filter
  - @prop {object} geoNodeConfiguration.`filters.fields` configuration of filter filter select inputs
  - @prop {object} geoNodeConfiguration.`filters.fields.options` list of [filter object](#filter-object) options
  - @prop {object} geoNodeConfiguration.`filters.order` configuration of order dropdown
  - @prop {object} geoNodeConfiguration.`filters.order.defaultLabelId` default label to use for the order dropdown button
  - @prop {object} geoNodeConfiguration.`filters.order.options` list of [order object](#order-object) options
  - @prop {object} geoNodeConfiguration.`filters.extent` configuration of extent filter
  - @prop {object} geoNodeConfiguration.`filters.extent.layers` a list of MapStore layers object used as extent background
  - @prop {object} geoNodeConfiguration.`filters.extent.style` a MapStore vector style object
- @prop {object} geoNodeConfiguration.`navbar` configuration of the brand navbar (top)
  - @prop {object} geoNodeConfiguration.`navbar.logo` list of [logo items](#logo-item)
  - @prop {object} geoNodeConfiguration.`navbar.items` list of [menu items object](#menu-item-object), right placement
- @prop {object} geoNodeConfiguration.`menu` configuration of the main menu
  - @prop {object} geoNodeConfiguration.`menu.items` list of [menu items object](#menu-item-object), left placement
  - @prop {object} geoNodeConfiguration.`menu.leftItems` list of [menu items object](#menu-item-object), left placement
  - @prop {object} geoNodeConfiguration.`menu.rightItems` list of [menu items object](#menu-item-object), right placement
- @prop {object} geoNodeConfiguration.`footer` configuration of the footer
  - @prop {object} geoNodeConfiguration.`footer.items` list of [menu items object](#menu-item-object)

### Filter Object

Filter object contains properties for a select input rendered inside the filter form. Configurations:

- properties for select input with static options:
```js
{
  "id": "title", // filter id used for the request filter{title.in}=
  "labelId": "gnhome.labelId", // message id for select label
  "placeholderId": "gnhome.placeholderId", // message id for select placeholder
  "type": "select", // supported only 'select' inputs
  "options": [ // list of string values
      "Title 1",
      "Title 2",
      "Title 3",
      "Title 4"
  ]
}
```

- properties for select input with suggestions request:
```js
{
  "labelId": "gnhome.resourceTypes", // message id for select label
  "placeholderId": "gnhome.resourceTypesPlaceholder", // message id for select placeholder
  "type": "select", // supported only 'select' inputs
  "suggestionsRequestKey": "resourceTypes" // available 'resourceTypes', 'categories', 'keywords', 'regions' or 'owners'
}
```

### Order Object

Order object contains properties for an entry of the order dropdown. Configuration:

```js
{
  "labelId": "gnhome.aZ", // message id for the dropdown item
  "value": "title" // value used in the sort filter
}
```
### Logo Item

Logo item contains properties for an image rendered in the top navbar. Configuration:

```js
{
  "src": "path/to/image.png", // image source
  "href": "#/", // logo href
  "style": { // default css style object
    "minHeight": 80
  },
  "sm": { // page size key small screen
    "style": { // small screen css style object
      "minHeight": 40
    }
  },
  "md": { // page size key medium screen
    "style": {} // medium screen css style object
  },
  "lg": { // page size key large screen
    "style": {} // large screen css style object
  }
}
```

### Menu Item Object

Menu item object contains properties for a list item rendered in a menu. Configuration:

- type link
```js
{
  "labelId": "gnhome.register", // label message id
  "type": "link", // one of 'link', 'dropdown', 'divider' or 'filter'
  "href": "/account/signup/?next=/", // link href
  "authenticated": false, // true shows the item only when user authenticated while false only for anonymous user, if undefined the item is always visible
  "badge": "${layersTotalCount}", // (menu configuration only) counter badge. variable available: layersTotalCount, mapsTotalCount, documentsTotalCount, geoappsTotalCount or geostoriesTotalCount
  "style": {} // (menu configuration only) css style object for a specific menu item
}
```

- type dropdown
```js
{
  "labelId": "gnhome.register", // label message id
  "type": "dropdown", // one of 'link', 'dropdown', 'divider' or 'filter'
  "authenticated": true, // true shows the item only when user authenticated while false only for anonymous user, if undefined the item is always visible
  "items": [] // menu items of type link or divider
}
```

- type divider
```js
{
  "type": "divider" // one of 'link', 'dropdown', 'divider' or 'filter'
}
```

- type filter
```js
{
  "type": "filter", // one of 'link', 'dropdown', 'divider' or 'filter'
  "id": "landuse", // unique id of the filter
  "labelId": "gnhome.customFilterExample", // label message id
  "query": { // query filter to use
    "filter{regions.name.in}": [
        "Global"
    ]
  }
}
```