"use strict";

/**************************************************************************
 * IMPORTS
 ***************************************************************************/

var fs = require("fs");


/**************************************************************************
 * FUNCTIONS
 ***************************************************************************/

/**
 * Entry point
 */
var bump_version = () => {
  var json = JSON.parse(fs.readFileSync("package.json", "utf8"));

  json.version = json.version.replace(/(\d+)$/, function(r) {
    return (r|0)+1
  });

  fs.writeFileSync("package.json", JSON.stringify(json, null, 2));
};


// Run script (via entry point)
bump_version();
