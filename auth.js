let jwt = require('jsonwebtoken');
const config = require('./configure.js');
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

let login = (req, res) => {
    let username = req.body.username;
    let password = req.body.password; 

    if (username && password) {
      //Fetching users from database
      pool.query(`SELECT * FROM users WHERE username = '${username}';`).then((result) => {
        if(result.rows[0].password == password){
          let token = jwt.sign({username: username},
            config.secret,
            { expiresIn: '24h' // expires in 24 hours
            }
          );
          // return the JWT token for the future API calls
          res.status(200).json({
            success: true,
            message: 'Authentication successful!',
            token: token
          });
        } else {
          res.status(403).json({
            success: false,
            message: 'Incorrect username or password'
          });
        }
      });
    } else res.status(400).send("Please check request.");
}

module.exports = {
  login: login
}