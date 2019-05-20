let express = require("express");
let pg = require("pg");
let router = express.Router();
let Pool = pg.Pool;
let pool = Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dataTest',
  password: 'password',
  port: 5432,
});

pool.connect();

router.use(express.json());

/**
 *  SELECT all different resources
 */
router.get("/", function(req, res, next) {
	console.log("Searching resources...");
	let queryString = 'SELECT * FROM resource_view';

  pool.query(queryString).then(function(r) {
    res.send(r.rows);
  }).catch(err => console.log('Err executing query', err.stack));

});

/**
 *  SELECT from one individual resource table, specified by the UUID.
 */
router.get("/:resource_uuid", function (req, res, next) {
  let resource_uuid = req.params.resource_uuid;
  let onlyLatest = req.query.onlyLatest;
  console.log(resource_uuid.replace("-", ""));
  //Still needs to be fixed to be used by views
  let queryString = `SELECT * FROM ${resource_uuid.replace(/-/g, "")} ORDER BY db_time_stamp ASC;`;
  pool.query(queryString).then(function (r) {
    if (onlyLatest === 'true')
      res.send(r.rows[0]);
    else
      res.send(r.rows);
  }).catch(err => console.error('Error executing query', err.stack));
});

/**
 * CREATE a new resource table, has to return tables UUID.
 */
router.post("/", function (req, res, next) {
  console.log(req.body);
  let queryString = "";
  let name = req.body.name, description = req.body.description, string_config = req.body.string_config,
    auto_start = req.body.auto_start, keep_connected = req.body.keep_connected, host_ip = req.body.host_ip;
  if (name && description && string_config && auto_start && keep_connected && host_ip) {
    if (req.body.resource_type_id) {
      let resource_type_id = req.body.resource_type_id, resource_model_id = req.body.resource_model_id,
        resource_adapter_id = req.body.resource_adapter_id;
      if (resource_type_id && resource_model_id && resource_adapter_id) {
        let resource_uuid = req.body.resource_uuid;
        if (resource_uuid) {
          queryString = `SELECT insert_resource('${resource_uuid}', '${resource_type_id}', '${resource_model_id}', '${resource_adapter_id}', ${name}, ${description}, '${string_config}', ${auto_start}, ${keep_connected}, '${host_ip}');`
        	console.log(queryString);
        } else {
          console.log("Second if");
          queryString = `SELECT insert_resource('${resource_type_id}', '${resource_model_id}', '${resource_adapter_id}', '${name}', '${description}', '${string_config}', ${auto_start}, ${keep_connected}, '${host_ip}');`
        }
      }
    } else {
      console.log("Third if");
      let resource_uuid = req.body.resource_uuid, resource_type = req.body.resource_type,
        resource_model = req.body.resource_model, resource_adapter = req.body.resource_adapter;
      if (resource_uuid && resource_type && resource_model && resource_adapter) {
        queryString = `SELECT insert_resource('${resource_uuid}', '${resource_type}', '${resource_model}', '${resource_adapter}', '${name}', '${description}', '${string_config}', ${auto_start}, ${keep_connected}, '${host_ip}');`
      }
    }
  }
  if (queryString) {
    pool.query(queryString).then(r => {
      res.send(r);
    }).catch(err => console.error('Error executing query', err.stack));
  } else {
    res.sendStatus(412);
  }

});

/**
 * INSERT a new row into the specified resource table.
 */
router.post("/:resource_uuid", function (req, res, next) {
    let resource_uuid = req.params.resource_uuid; 
    let sample = req.body.sample, unit = req.body.unit;
    var date = new Date();
    console.log(date);
    let queryString = `SELECT insert_${resource_uuid.replace(/-/g, "")}(${sample}, ${unit}, TO_TIMESTAMP('${date.getDate()}-${date.getMonth()}-${date.getYear()}', 'DD-MM-YY'), TO_TIMESTAMP('${date.getDate()}-${date.getMonth()}-${date.getYear()}', 'DD-MM-YY'));`;
    pool.query(queryString, (error, result) => {
    	if(error){
    		throw error;
    	}
    	res.sendStatus(201); 
    });
});

/**
 * UPDATE table "uuid" WHERE id = "row_id".
 */
router.put("/:resource_uuid/:row_id", function (req, res, next) {
  let resource_uuid = req.params.resource_uuid;
  let row_id = req.params.row_id;
  pool.query(""/*function*/, [resource_uuid, row_id], (error, result) => {
    if (error) {
      throw error;
    }
    res.sendStatus(201);
  });
});

/**
 * DROP TABLE "uuid" & probably delete row with the resource_uuid in the resorcues table.
 */
router.delete("/:resource_uuid", function (req, res, next) {
    let resource_uuid = req.params.resource_uuid;
  	let queryString = `SELECT drop_resource_table('${resource_uuid.replace(/-/g, "")}');`; 
    console.log(queryString);
  	pool.query(queryString).then(function(){
      res.sendStatus(200); 
      console.log('Table deleted.');
    }).catch(err => console.error('Error executing query', err.stack));
});

/**
 * DELETE the row with row_id from table with resource_id.
 */
router.delete("/:resource_uuid/:row_id", function (req, res, next) {
  let resource_uuid = req.params.resource_uuid;
  let row_id = req.params.row_id;
  pool.query(""/*function*/, [resource_uuid, row_id], (error, result) => {
    if (error) {
      throw error;
    }
    //return success
  });
});


module.exports = router;
