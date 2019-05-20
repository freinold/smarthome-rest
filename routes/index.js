var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get("/insert_resource", (req, res, next) => {
  res.render("insert_resource", { title: "Insert resource"});
});

module.exports = router;