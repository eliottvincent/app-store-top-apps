"use strict";

/**************************************************************************
 * IMPORTS
 ***************************************************************************/

var fs    = require("fs");
var https = require("https");
var os    = require("os");
var path  = require("path");
var url   = require("url");


/**************************************************************************
 * CONFIGURATION
 ***************************************************************************/

var DATA_DIR = path.join(__dirname, "/../data/");

var ACTION_TEMPORIZE_DELAY = 500; // 500 milliseconds

var STORE_FRONTS = [
  // [store_front_id, country_code]
  [143505, "ar"], // Argentina
  [143460, "au"], // Australia
  [143445, "at"], // Austria
  [143446, "be"], // Belgium
  [143503, "br"], // Brazil
  [143455, "ca"], // Canada
  [143483, "cl"], // Chile
  [143465, "cn"], // China
  [143501, "co"], // Colombia
  [143495, "cr"], // Costa Rica
  [143494, "hr"], // Croatia
  [143489, "cz"], // Czech Republic
  [143458, "dk"], // Denmark
  [143508, "do"], // Dominican Rep.
  [143509, "ec"], // Ecuador
  [143516, "eg"], // Egypt
  [143506, "sv"], // El Salvador
  [143518, "ee"], // Estonia
  [143447, "fi"], // Finland
  [143442, "fr"], // France
  [143443, "de"], // Germany
  [143448, "gr"], // Greece
  [143504, "gt"], // Guatemala
  [143510, "hn"], // Honduras
  [143463, "hk"], // Hong Kong
  [143482, "hu"], // Hungary
  [143467, "in"], // India
  [143476, "id"], // Indonesia
  [143449, "ie"], // Ireland
  [143491, "il"], // Israel
  [143450, "it"], // Italy
  [143511, "jm"], // Jamaica
  [143462, "jp"], // Japan
  [143517, "kz"], // Kazakstan
  [143466, "kr"], // Korea, Republic Of
  [143493, "kw"], // Kuwait
  [143519, "lv"], // Latvia
  [143497, "lb"], // Lebanon
  [143520, "lt"], // Lithuania
  [143451, "lu"], // Luxembourg
  [143515, "mo"], // Macau
  [143473, "my"], // Malaysia
  [143521, "mt"], // Malta
  [143468, "mx"], // Mexico
  [143523, "md"], // Moldova, Republic Of
  [143452, "nl"], // Netherlands
  [143461, "nz"], // New Zealand
  [143512, "ni"], // Nicaragua
  [143457, "no"], // Norway
  [143477, "pk"], // Pakistan
  [143485, "pa"], // Panama
  [143513, "py"], // Paraguay
  [143507, "pe"], // Peru
  [143474, "ph"], // Philippines
  [143478, "pl"], // Poland
  [143453, "pt"], // Portugal
  [143498, "qa"], // Qatar
  [143487, "ro"], // Romania
  [143469, "ru"], // Russia
  [143479, "sa"], // Saudi Arabia
  [143464, "sg"], // Singapore
  [143496, "sk"], // Slovakia
  [143499, "si"], // Slovenia
  [143472, "za"], // South Africa
  [143454, "es"], // Spain
  [143486, "lk"], // Sri Lanka
  [143456, "se"], // Sweden
  [143459, "ch"], // Switzerland
  [143470, "tw"], // Taiwan
  [143475, "th"], // Thailand
  [143480, "tr"], // Turkey
  [143481, "ae"], // United Arab Emirates
  [143444, "gb"], // United Kingdom
  [143441, "us"], // United States
  [143514, "uy"], // Uruguay
  [143502, "ve"], // Venezuela
  [143471, "vn"]  // Vietnam
];

var GENRES = [
  // [genre_id, genre_name]
  [6000, "business"],                // Business
  [6001, "weather"],                 // Weather
  [6002, "utilities"],               // Utilities
  [6003, "travel"],                  // Travel
  [6004, "sports"],                  // Sports
  [6005, "social_networking"],       // Social Networking
  [6006, "reference"],               // Reference
  [6007, "productivity"],            // Productivity
  [6008, "photo_and_video"],         // Photo & Video
  [6009, "news"],                    // News
  [6010, "navigation"],              // Navigation
  [6011, "music"],                   // Music
  [6012, "lifestyle"],               // Lifestyle
  [6013, "health_and_fitness"],      // Health & Fitness
  [6014, "games"],                   // Games
  [6015, "finance"],                 // Finance
  [6016, "entertainment"],           // Entertainment
  [6017, "education"],               // Education
  [6018, "book"],                    // Book
  [6020, "medical"],                 // Medical
  [6021, "magazine_and_newspapers"], // Magazine & Newspapers
  [6022, "catalogs"],                // Catalogs
  [6023, "food_and_drink"],          // Food & Drink
  [6024, "shopping"],                // Shopping
  [6025, "stickers"],                // Stickers
  [6026, "developer_tools"],         // Developer Tools
  [6027, "graphics_and_design"]      // Graphics & Design
];

var PRICINGS = [
  "paid",
  "free"
];

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
      _new_apps = (body.feed || {}).entry;

      _apps_changed = (
        JSON.stringify(_new_apps) !== JSON.stringify(_existing_apps)
      );

      if (_apps_changed && _new_apps) {
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
