"use strict";

/**************************************************************************
 * IMPORTS
 ***************************************************************************/

var fs    = require("fs");
var https = require("https");
var os    = require("os");
var path  = require("path");
var url   = require("url");

var store_fronts = require("./../res/store_fronts");
var pricings     = require("./../res/pricings");
var genres       = require("./../res/genres");


/**************************************************************************
 * CONFIGURATION
 ***************************************************************************/

var DATA_DIR = path.join(__dirname, "/../data/");

var ACTION_TEMPORIZE_DELAY = 500; // 500 milliseconds

var STORE_FRONTS = store_fronts;
var GENRES       = genres;
var PRICINGS     = pricings;

var APPLE = {
  METHOD   : "GET",
  ENDPOINT : (store_front, pricing, genre) => {
    return (
      "https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/RSS/" +
        `top${pricing}applications/sf=${store_front}/limit=100/genre=${genre}/json`
      )
  }
};


/**************************************************************************
 * FUNCTIONS
 ***************************************************************************/

/**
 * Ensures a JSON file exists
 * @private
 * @param  {string} path
 * @return {object} Promise object
 */
var __ensure_json_file = (path) => {
  return Promise.resolve()
    .then(() => {
      return fs.promises.stat(
        path
      );
    })
    .catch(() => {
      // Remove file from path
      let _path = path.substring(0, path.lastIndexOf("/"));

      return fs.promises.mkdir(
        _path,
        {
          recursive : true
        }
      )
        .then(() => {
          return __write_json_file(
            path, []
          );
        });
    });
}

/**
 * Reads from a JSON file
 * @private
 * @param  {string} path
 * @return {object} Promise object
 */
var __read_json_file = (path) => {
  return new Promise((resolve, reject) => {
    return fs.readFile(
      path,

      (error, buffer) => {
        if (error !== null) {
          return reject(error);
        }

        return resolve(JSON.parse(buffer))
      });
  });
}

/**
 * Writes to a JSON file
 * @private
 * @param  {string} path
 * @param  {string} content
 * @return {object} Promise object
 */
var __write_json_file = (path, content) => {
  return new Promise((resolve, reject) => {
    return fs.writeFile(
      path,
      JSON.stringify(content, null, 2),

      {
        encoding : "utf8"
      },

      (error) => {
        if (error !== null) {
          return reject(error);
        }

        return resolve();
      });
  });
};

/**
 * Temporizes action
 * @private
 * @param  {object} [forwarded_value]
 * @param  {number} [delay]
 * @return {object} Promise object
 */
var __temporize_action = (forwarded_value = undefined, delay = 0) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(forwarded_value);
    }, delay || ACTION_TEMPORIZE_DELAY);
  });
};

/**
 * Executes a list of promises, sequentially
 * @private
 * @param  {object} promises
 * @return {object} Promise object
 */
var __execute_sequentially = (promises) => {
  return promises.reduce((accumulator, promise) => {
    let _results;

    return accumulator
      .then(results => {
        _results = results;

        return __temporize_action();
      })
      .then(() => {
        return promise();
      })
      .then(result => {
        _results.push(result);

        return Promise.resolve(_results)
      })
  }, Promise.resolve([]));
};

/**
 * Dispatches an HTTPS request
 * @private
 * @param  {string} method
 * @param  {string} uri
 * @return {object} Promise object
 */
var __dispatch_request = (method, uri) => {
  let _url            = url.parse(uri),
      _request_params = {
        method : method
      };

  _request_params.host = _url.host;
  _request_params.port = _url.port;
  _request_params.path = _url.path;

  return new Promise((resolve, reject) => {
    var request = https.request(_request_params, (response) => {
      let _body = "";

      response.setEncoding("utf8");

      response.on("data", (chunk) => {
        _body += chunk;
      });

      response.on("end", () => {
        if (_body.length) {
          try {
            _body = JSON.parse(_body);
          } catch(error) {
            return reject(error);
          }
        }

        if (response.statusCode !== 200) {
          return reject(
            new Error(`Got error: ${response.statusCode}`)
          );
        } else {
          return resolve(_body);
        }
      });
    });


    request.on("timeout", function() {
      request.abort();
    });

    request.on("abort", function(error) {
      return reject(error);
    });

    request.on("error", function(error) {
      return reject(error);
    });

    request.on("close", function() {
      return resolve();
    });

    request.end();
  });
};

/**
 * Updates apps for a store front (country), category and pricing
 * @private
 * @param  {number} store_front
 * @param  {string} pricing
 * @param  {number} genre
 * @return {object} Promise object
 */
var update_apps = (store_front, pricing, genre) => {
  // Log trace
  console.log(`update_apps:${store_front[1]}:${pricing}:${genre[1]}`);

  let _existing_apps = {},
      _new_apps      = {},
      _apps_changed  = false,
      _data_path     = path.join(
        DATA_DIR,

        `${store_front[1]}`,
        `${pricing}`,
        `${genre[1]}.json`
      );

  return Promise.resolve()
    .then(() => {
      return __ensure_json_file(_data_path);
    })
    .then(() => {
      return __read_json_file(_data_path);
    })
    .then(existing_apps => {
      _existing_apps = existing_apps;

      if (_existing_apps === {}) {
        return Promise.reject(
          "No existing apps for this store front, pricing and genre"
        );
      }

      return __dispatch_request(
        APPLE.METHOD,
        APPLE.ENDPOINT(store_front[0], pricing, genre[0])
      );
    })
    .then(body => {
      _new_apps = ((body.feed || {}).entry || []);

      _new_apps = _new_apps.map((app, index) => {
        return {
          $position : {
            current : index + 1,
            limit   : _new_apps.length
          },

          ...app
        }
      });

      _apps_changed = (
        JSON.stringify(_new_apps) !== JSON.stringify(_existing_apps)
      );

      if (_apps_changed && _new_apps.length > 0) {
        return __write_json_file(_data_path, _new_apps);
      }

      return Promise.resolve();
    })
    .then(() => {
      if (_apps_changed) {
        return Promise.resolve(true);
      }

      return Promise.resolve(false);
    });
};

/**
 * Entry point
 */
var update = () => {
  return Promise.resolve()
    .then(() => {
      let _updates = [];

      // Map all updates to perform
      STORE_FRONTS.map(store_front => {
        PRICINGS.map(pricing => {
          GENRES.map(genre => {
            _updates.push(
              () => {
                return update_apps(store_front, pricing, genre);
              }
            )
          });
        });
      });

      return Promise.resolve(_updates);
    })
    .then((updates) => {
      // Execute updates sequentially & with a delay, to avoid Apple's rate \
      //   limit
      return __execute_sequentially(updates);
    })
    .then((results) => {
      process.stdout.write(os.EOL);

      if (results.indexOf(true) !== -1) {
        // At least one top updated
        process.stdout.write("::set-output name=status::updated" + os.EOL);
      } else {
        // No top updated
        process.stdout.write("::set-output name=status::none_updated" + os.EOL);
      }

      process.exit(0);
    })
    .catch((error) => {
      console.error(error);

      process.exit(1);
    });
};


// Run script (via entry point)
update();
