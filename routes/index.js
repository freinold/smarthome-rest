var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'SmartHome-REST' });
});

router.get("/insert_resource", (req, res, next) => {
  res.render("insert_resource", { title: "Insert new resource"});
});

router.get("/insert_row", (req, res, next) => {
  res.render("insert_row", { title: "Insert new row into resource"})
});

module.exports = router;