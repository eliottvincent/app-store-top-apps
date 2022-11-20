# App Store Top Apps

[![Build Status](https://github.com/eliottvincent/app-store-top-apps/actions/workflows/action.yml/badge.svg)](https://github.com/eliottvincent/app-store-top-apps/actions) [![NPM](https://img.shields.io/npm/v/app-store-top-apps.svg)](https://www.npmjs.com/package/app-store-top-apps) [![Downloads](https://img.shields.io/npm/dt/app-store-top-apps.svg)](https://www.npmjs.com/package/app-store-top-apps)

App Store' Top Apps, by countries, pricing and genres. The data **auto-updates every day**.


## Usage

```js
const { isAppTop, getAppPositions } = require("app-store-top-apps");

console.log(isAppTop("com.alertus.zenly"));
// true

console.log(getAppPositions("com.alertus.zenly"));
// […, {country_code: 'fr', pricing: 'free', genre: 'social_networking', index: 13, total: 100}, …]
```


## API

### Access to data

The raw sets of top apps, as returned by Apple iTunes API, are made accessible:

```js
// All top apps in France
const { fr } = require("app-store-top-apps");

// All top free apps in France
const { fr_free } = require("app-store-top-apps");

// All top paid entertainment apps in France
const { fr_paid_entertainment } = require("app-store-top-apps");

// OR
const appStore = require("app-store-top-apps");

// All top apps in France
console.log(appStore.data.fr);

// All top free apps in France
console.log(appStore.data.fr_free);

// All top paid entertainment apps in France
console.log(appStore.data.fr_paid_entertainment);
```

### Check if an app is top
`isAppTop(bundleId, countryCode, pricing, genre)` returns whether an app is top or not:
* `bundleId` the app's bundle identifier
* `countryCode` the country code (optional)
* `pricing` can be either `free` or `paid` (optional)
* `genre` the app's genre (optional)

```js
const { isAppTop } = require("app-store-top-apps");

console.log(isAppTop("com.alertus.zenly"));
// true

console.log(isAppTop("com.alertus.zenly"), "fr");
// true

console.log(isAppTop("com.alertus.zenly", "fr", "paid"));
// false
```

### Get app top position(s)
`getAppPositions(bundleId, countryCode, pricing, genre)` returns the app top position(s):
* `bundleId` the app's bundle identifier
* `countryCode` the country code (optional)
* `pricing` can be either `free` or `paid` (optional)
* `genre` the app's genre (optional)

```js
const { getAppPositions } = require("app-store-top-apps");

console.log(getAppPositions("com.alertus.zenly"));
// […, {country_code: 'fr', pricing: 'free', genre: 'social_networking', index: 13, total: 100}, …]

console.log(getAppPositions("com.alertus.zenly", "fr"));
// [{country_code: 'fr', pricing: 'free', genre: 'social_networking', index: 13, total: 100}]
```


## License

app-store-top-apps is released under the MIT License. See the bundled LICENSE file for details.
