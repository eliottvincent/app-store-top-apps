"use strict";

/**************************************************************************
 * IMPORTS
 ***************************************************************************/

var src = require("./../src/");

/**************************************************************************
 * CONFIGURATION
 ***************************************************************************/

var DEFAULT_1_BUNDLE_IDENTIFIER = "com.alertus.zenly";
var DEFAULT_2_BUNDLE_IDENTIFIER = "fr.lemonde.matin";
var NON_TOP_BUNDLE_IDENTIFIER = "com.jomo.Jomo";

/**************************************************************************
 * TESTS
 ***************************************************************************/

module.exports = {
  testData: function(test) {
    test.expect(6);

    var actual = src.fr;
    var message = "fr data should not be empty."
    test.ok(actual, message);
    test.equal(actual.length > 0, true, message);

    var actual = src.fr_free;
    var message = "fr_free data should not be empty."
    test.ok(actual, message);
    test.equal(actual.length > 0, true, message);

    var actual = src.fr_free_book;
    var message = "fr_free_book data should not be empty."
    test.ok(actual, message);
    test.equal(actual.length > 0, true, message);

    test.done();
  },

  testIsAppTop: function(test) {
    test.expect(10);

    var actual = src.isAppTop;
    var message = "isAppTop should be defined."
    test.ok(actual, message);
    test.equal(typeof actual, "function", message);

    var actual = function() { src.isAppTop() };
    test.throws(actual, Error, "isAppTop with no bundle identifier should throw an error.");

    var actual = src.isAppTop(DEFAULT_1_BUNDLE_IDENTIFIER);
    test.equals(actual, true, "default usage should work.");

    var actual = src.isAppTop(NON_TOP_BUNDLE_IDENTIFIER);
    test.equals(actual, false, "usage with non-top app should work.");

    var actual = src.isAppTop(DEFAULT_1_BUNDLE_IDENTIFIER, "fr");
    test.equals(actual, true, "usage with countryCode should work.");

    var actual = src.isAppTop(DEFAULT_1_BUNDLE_IDENTIFIER, "fr", "free");
    test.equals(actual, true, "usage with countryCode and pricing should work.");

    var actual = src.isAppTop(DEFAULT_1_BUNDLE_IDENTIFIER, "fr", "paid");
    test.equals(actual, false, "usage with countryCode and pricing should work.");

    var actual = src.isAppTop(DEFAULT_1_BUNDLE_IDENTIFIER, "fr", "free", "travel");
    test.equals(actual, false, "usage with countryCode, pricing and genre should work.");

    var actual = src.isAppTop(DEFAULT_1_BUNDLE_IDENTIFIER, "fr", "free", "social_networking");
    test.equals(actual, true, "usage with countryCode, pricing and genre should work.");

    test.done();
  },

  testGetAppPositions: function(test) {
    test.expect(11);

    var actual = src.getAppPositions;
    var message = "getAppPositions should be defined."
    test.ok(actual, message);
    test.equal(typeof actual, "function", message);

    var actual = function() { src.getAppPositions() };
    test.throws(actual, Error, "getAppPositions with no bundle identifier should throw an error.");

    var actual = src.getAppPositions(DEFAULT_1_BUNDLE_IDENTIFIER);
    test.equals(actual.length, 1, "default usage should work.");

    var actual = src.getAppPositions(DEFAULT_2_BUNDLE_IDENTIFIER, "fr");
    test.equals(actual.length, 2, "default usage should work (multiple positions).");

    var actual = src.getAppPositions(NON_TOP_BUNDLE_IDENTIFIER);
    test.equals(actual, null, "usage with non-top app should work.");

    var actual = src.getAppPositions(DEFAULT_1_BUNDLE_IDENTIFIER, "fr");
    test.equals(actual.length, 1, "usage with countryCode should work.");

    var actual = src.getAppPositions(DEFAULT_1_BUNDLE_IDENTIFIER, "fr", "free");
    test.equals(actual.length, 1, "usage with countryCode and pricing should work.");

    var actual = src.getAppPositions(DEFAULT_1_BUNDLE_IDENTIFIER, "fr", "paid");
    test.equals(actual, null, "usage with countryCode and pricing should work.");

    var actual = src.getAppPositions(DEFAULT_1_BUNDLE_IDENTIFIER, "fr", "free", "travel");
    test.equals(actual, null, "usage with countryCode, pricing and genre should work.");

    var actual = src.getAppPositions(DEFAULT_1_BUNDLE_IDENTIFIER, "fr", "free", "social_networking");
    test.equals(actual.length, 1, "usage with countryCode, pricing and genre should work.");

    test.done();
  }
};
