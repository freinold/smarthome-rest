let express = require("express");
let pg = require("pg");
let router = express.Router();
let Pool = pg.Pool;
let pool = Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'marina',
	password: 'password', 
	port: 5432,
}); 

pool.connect();

//router.use(express.json);

/**
 *  SELECT all different resources
 */
router.get("/", function(req, res, next) {
	console.log("Searching resources...");
	try{
		let result = pool.query("SELECT * FROM info;");
		result.then(function(r){
			r.rows.forEach(row => {
				console.log(row);
			});
			res.send(r);
		});
		return;
	}catch(error){
		console.log(error);
		return next();
	}
});

/**
 *  SELECT from one individual resource table, specified by the UUID.
 */
router.get("/:resource_uuid", function (req, res, next) {
	let resource_uuid = req.params.resource_uuid;
	let onlyLatest = req.query.onlyLatest;
	let queryString = "SELECT * FROM ${resource_uuid} ORDER BY name ASC;";
	pool.query(queryString).then(function(r){
			if(onlyLatest == 'true')
			  res.send(r.rows[0]);
			else
			  res.send(r.rows);
		}).catch(err => console.error('Error executing query', err.stack));
});

/**
 * CREATE a new resource table, has to return tables UUID.
 */
router.post("/", function (req, res, next) {
	let {v_name, v_attributes} = req.body;
	//Not sure aboute the function, maybe create_resource_table(text, text) ?
	pool.query('create_resource_table($1, $2)', [v_name, v_attributes], (error, result) => {
		if(error){
			throw error;
		}
		//res.status(201).send('New table created with UUID: ${v_name}');
   });  
});

/**
 * INSERT a new row into the specified resource table.
 */
router.post("/:resource_uuid", function (req, res, next) {
    let resource_uuid = req.params.resource_uuid; 
    // pool.query(/*function*/, [resource_uuid], (error, result) => {
    // 	if(error){
    // 		throw error;
    // 	}
    // 	//return success 
    // });
});

/**
 * UPDATE table "uuid" WHERE id = "row_id".
 */
router.put("/:resource_uuid/:row_id", function (req, res, next) {
	let resource_uuid = req.params.resource_uuid; 
	let row_id = req.params.row_id;
	// pool.query(/*function*/, [resource_uuid, row_id], (error, result) => {
	// 	if(error){
	// 		throw error; 
	// 	}
	// 	//return success 
	// });
});

/**
 * DROP TABLE "uuid" & probably delete row with the resource_uuid in the resorcues table.
 */
router.delete("/:resource_uuid", function (req, res, next) {
	const resource_uuid = req.params.resource_uuid; 
	//Not sure about the function, maybe delete_resource_db_objects(uuid) ?
	pool.query('delete_resource_db_objects($1)', [resource_uuid], (error, result) => {
		if(error){
			throw error;
		}
		res.stauts(200).send('Table deleted with ID: ${resource_uuid}');
	})
});

/**
 * DELETE the row with row_id from table with resource_id.
 */
router.delete("/:resource_uuid/:row_id", function (req, res, next) {
	let resource_uuid = req.params.resource_uuid; 
	let row_id = req.params.row_id;
	// pool.query(/*function*/, [resource_uuid, row_id], (error, result) => {
	// 	if(error){
	// 		throw error; 
	// 	}
	// 	//return success 
	// });
});

module.exports = router;
