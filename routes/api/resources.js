let express = require("express");
let pg = require("pg");
let fs = require("fs");

let router = express.Router();
router.use(express.json());

let Pool = pg.Pool;
let pool;
let dbConfig;

fs.readFile(__dirname.replace("/routes/api", "") + "/db/db_config.json", (err, content) => {
  dbConfig = JSON.parse(content);
  pool = Pool(dbConfig);
  pool.connect();
});


/**
 *  SELECT all different resources
 */
router.get("/", function (req, res, next) {
  let queryString = `SELECT * FROM resource_view`;
  pool.query(queryString).then((result) => {
    res.insert_resource(result.rows);
  }).catch(err => res.status(400).insert_resource("Error processing database request:\n", err));

});

/**
 *  SELECT from one individual resource table, specified by the UUID.
 *  To get the last entry only, specify onlyLatest=true
 */
router.get("/:resource_uuid", function (req, res, next) {
  let resource_uuid = req.params.resource_uuid;
  let onlyLatest = req.query.onlyLatest;
  console.log(resource_uuid.replace(/"-"/g, ""));
  //Still needs to be fixed to be used by views
  let queryString = `SELECT * FROM ${resource_uuid.replace(/-/g, "")} ORDER BY db_time_stamp ASC;`;
  pool.query(queryString).then((queryResult) => {
    if (onlyLatest === 'true') {
      res.status(200).insert_resource(queryResult.rows[0]);
    } else {
      res.status(200).insert_resource(queryResult.rows);
    }
  }).catch(err => res.status(400).insert_resource("Error processing database request:\n", err));
});

/**
 * CREATE a new resource table, has to return tables UUID.
 */
router.post("/", function (req, res, next) {
  console.log(req.body);
  let queryString = "";
  let booleansInRightFormat = true;
  let name = req.body.name, description = req.body.description, string_config = req.body.string_config,
    auto_start = req.body.auto_start, keep_connected = req.body.keep_connected, host_ip = req.body.host_ip;
  // Checks for presence of the parameters needed for all 3 functions
  if (name && description && string_config && (auto_start != null) && (keep_connected != null) && host_ip) {
    string_config = JSON.stringify(string_config);
    console.log(string_config);
    // Check if both booleans are in the right format.
    switch (auto_start) {
      case true:
        auto_start = "TRUE";
        break;
      case false:
        auto_start = "FALSE";
        break;
      case "TRUE":
      case "FALSE":
        break;
      default:
        booleansInRightFormat = false;
        break;
    }
    switch (keep_connected) {
      case true:
        keep_connected = "TRUE";
        break;
      case false:
        keep_connected = "FALSE";
        break;
      case "TRUE":
      case "FALSE":
        break;
      default:
        booleansInRightFormat = false;
        break;
    }
    // Checks if the resource type id is present. If yes, all resource related parameters should be given as ids.
    if (req.body.resource_type_id) {
      console.log(req.body.resource_type_id);
      let resource_type_id = req.body.resource_type_id, resource_model_id = req.body.resource_model_id,
        resource_adapter_id = req.body.resource_adapter_id;
      // Checks if all the other resouce related parameters are actually there.
      if (resource_type_id && resource_model_id && resource_adapter_id) {
        let resource_uuid = req.body.resource_uuid;
        // Checks if there is already a resource uuid present.
        if (resource_uuid) {
          queryString = `SELECT insert_resource('${resource_uuid}', '${resource_type_id}', '${resource_model_id}', '${resource_adapter_id}', ${name}, ${description}, '${string_config}', ${auto_start}, ${keep_connected}, '${host_ip}');`
        } else {
          queryString = `SELECT insert_resource('${resource_type_id}', '${resource_model_id}', '${resource_adapter_id}', '${name}', '${description}', '${string_config}', ${auto_start}, ${keep_connected}, '${host_ip}');`
        }
      }
    } else {
      // All resource related parameters should be given as text.
      let resource_uuid = req.body.resource_uuid, resource_type = req.body.resource_type,
        resource_model = req.body.resource_model, resource_adapter = req.body.resource_adapter;
      // Check if the resource related parameters and the resource uuid are actually there.
      if (resource_uuid && resource_type && resource_model && resource_adapter) {
        queryString = `SELECT insert_resource('${resource_uuid}', '${resource_type}', '${resource_model}', '${resource_adapter}', '${name}', '${description}', '${string_config}', ${auto_start}, ${keep_connected}, '${host_ip}');`
      }
    }
  }
  console.log(queryString);
  if (queryString && booleansInRightFormat) {
    // queryString is present and booleans in the right format, so the parameters were legal.
    pool.query(queryString).then(queryResult => {
      res.status(200).send(queryResult);
    }).catch(err => res.status(400).send("Error processing database request:\n" + err));
  } else {
    // No queryString present or booleans in the wrong format -> Wrong parameters, send HTTP Error Code 418: I'm a teapot.
    let errorMessage = "";
    if (queryString === "") {
      errorMessage += "One of the required parameters was missing or the JSON representation was wrong.\nProvided JSON was:\n" + JSON.stringify(req.body) + "\n";
    }
    if (!booleansInRightFormat) {
      errorMessage += "One of the boolean values was not provided the right way, please check the representation."
    }
    res.status(400).send("Error processing payload:\n" + errorMessage);
  }
});

/**
 * INSERT a new row into the specified resource table.
 */
router.post("/:resource_uuid", function (req, res, next) {
  let resource_uuid = req.params.resource_uuid;
  let sample = req.body.sample, unit = req.body.unit;
  let queryString = `SELECT insert_${resource_uuid.replace(/-/g, "")}('${sample}', ${unit}, (SELECT CURRENT_TIMESTAMP), (SELECT CURRENT_TIMESTAMP));`;
  pool.query(queryString).then((queryResult) => {
    res.status(201).insert_resource(queryResult);
  }).catch(err => res.status(400).insert_resource("Error processing database request:\n", err));

});


/**
 * DROP TABLE "uuid".
 */
router.delete("/:resource_uuid", function (req, res, next) {
  let resource_uuid = req.params.resource_uuid;
  let queryString = `SELECT drop_resource_table('${resource_uuid.replace(/-/g, "")}'); DELETE FROM resource WHERE resource_uuid = '${resource_uuid.replace(/-/g, "")}';`;
  console.log(queryString);
  pool.query(queryString).then((queryResult) => {
    res.status(200).insert_resource('Table deleted.');
  }).catch(err => res.status(400).insert_resource("Error processing database request:\n", err));
});


/*
 * UPDATE row in table resources according to given uuid. 
 * Provide column and value to be replaced in the body. 
 */
router.put("/:resource_uuid", function (req, res, next) {
  let column = req.body.column, value = req.body.value;
  let resource_uuid = req.params.resource_uuid;
  let queryString = `UPDATE resource SET ${column} = '${value}' WHERE resource_uuid = '${resource_uuid.replace(/-/g, "")}';`;
  console.log(queryString);
  pool.query(queryString).then((queryResult) => {
    res.status(200).insert_resource('Table updated.');
  }).catch(err => res.status(400).insert_resource("Error processing database request:\n", err));
});


module.exports = router;
