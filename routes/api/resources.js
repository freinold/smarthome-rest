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
		//Correct it to display the results better
		result.then(function(r){
			res.send(r.rows);
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
	let queryString = 'SELECT * FROM info ORDER BY name ASC;';
	try{
		let result = pool.query(queryString);
		result.then(function(r){
			if(onlyLatest == 'true'){
				res.send(r.rows[0]);
			}
			else res.send(r.rows);
		});
		return;
	}catch(error){
		console.log(error);
		return next();
	}
});

/**
 * CREATE a new resource table, has to return tables UUID.
 */
router.post("/", function (req, res, next) {
	let {name, email} = req.body;
	//Not sure aboute the function, maybe create_resource_table(text, text) ?
	pool.query('INSERT INTO info VALUES ($1, $2)', [name, email], (error, result) => {
		if(error){
			throw error;
		}
		res.sendStatus(201);
   });  
});

/**
 * INSERT a new row into the specified resource table.
 */
router.post("/:resource_uuid", function (req, res, next) {
    let resource_uuid = req.params.resource_uuid; 
<<<<<<< HEAD
    let {name, email} = req.body;
	//Not sure aboute the function, maybe create_resource_table(text, text) ?
	pool.query('INSERT INTO $1 VALUES ($2, $3)', [resource_uuid, name, email], (error, result) => {
		if(error){
			throw error;
		}
		res.sendStatus(201);
   });
=======
    pool.query(""/*function*/, [resource_uuid], (error, result) => {
    	if(error){
    		throw error;
    	}
    	//return success 
    });
>>>>>>> d88128c5023a2d96a7026d675836d955b282f846
});

/**
 * UPDATE table "uuid" WHERE id = "row_id".
 */
router.put("/:resource_uuid/:row_id", function (req, res, next) {
	let resource_uuid = req.params.resource_uuid; 
	let row_id = req.params.row_id;
	pool.query(""/*function*/, [resource_uuid, row_id], (error, result) => {
		if(error){
			throw error; 
		}
		//return success 
	});
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
	pool.query(""/*function*/, [resource_uuid, row_id], (error, result) => {
		if(error){
			throw error; 
		}
		//return success 
	});
});

module.exports = router;
