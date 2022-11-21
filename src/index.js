"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**************************************************************************
 * IMPORTS
 ***************************************************************************/

var store_fronts = require("./../res/config/store_fronts");
var pricings     = require("./../res/config/pricings");
var genres       = require("./../res/config/genres");

var apps = require("./../data/apps.json");

/**************************************************************************
 * FUNCTIONS
 ***************************************************************************/

/**
 * Checks whether an app is top or not
 * @public
 * @param  {string}  bundleId
 * @param  {string}  [countryCode]
 * @param  {string}  [pricing]
 * @param  {string}  [genre]
 * @return {boolean} Whether the app is top or not
 */
var isAppTop = function(
  bundleId, countryCode = null, pricing = null, genre = null
) {
  return !!getAppPositions(bundleId, countryCode, pricing, genre);
};

/**
 * Get app top position(s)
 * @public
 * @param  {string} bundleId
 * @param  {string} [countryCode]
 * @param  {string} [pricing]
 * @param  {string} [genre]
 * @return {object} The app top position(s)
 */
var getAppPositions = function(
  bundleId, countryCode = null, pricing = null, genre = null
) {
  if (!bundleId) {
    throw new Error("Missing bundle identifier");
  }

  let _positions = apps[bundleId];

  if (_positions) {
    _positions = _positions.filter((position) => {
      return (
        (countryCode ? position.country_code === countryCode : true) &&
        (pricing     ? position.pricing      === pricing     : true) &&
        (genre       ? position.genre        === genre       : true)
      );
    })

    return _positions.length > 0 ? _positions : null;
  }

  return null;
};

/**************************************************************************
 * EXPORTS
 ***************************************************************************/

let _export = {
  isAppTop        : isAppTop,
  getAppPositions : getAppPositions,

  data            : {}
};

// Dynamically export all data
store_fronts.map(store_front => {
  let _data_country = [],
    _country_code = store_front[1];

  pricings.map(pricing => {
    let _data_country_pricing = [];

    genres.map(genre => {
      let _data_country_pricing_genre,
        _genre = genre[1];

      try {
         _data_country_pricing_genre = require(
           `./../data/${_country_code}/${pricing}/${_genre}.json`
         );

         _data_country = _data_country.concat(_data_country_pricing_genre);
         _data_country_pricing = _data_country_pricing.concat(
           _data_country_pricing_genre
         );
      } catch {
        // Ignore
      }

      exports[`${_country_code}_${pricing}_${_genre}`] = (
        _data_country_pricing_genre
      );
      _export.data[`${_country_code}_${pricing}_${_genre}`] = (
        _data_country_pricing_genre
      )
    });

    exports[`${_country_code}_${pricing}`] = _data_country_pricing
    _export.data[`${_country_code}_${pricing}`] = _data_country_pricing
  });

  exports[_country_code] = _data_country;
  _export.data[_country_code] = _data_country;
});

exports.isAppTop        = isAppTop;
exports.getAppPositions = getAppPositions;

exports.default         = _export;
