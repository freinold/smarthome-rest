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

router.get("/read_resources", (req, res, next) => {
  res.render("read_resources", { title: "Read all resources"})
});

router.get("/read_resource", (req, res, next) => {
  res.render("read_resource", { title: "Read one resource"})
});

router.get("/update_resource", (req, res, next) => {
  res.render("update_resource", { title: "Update resource metadata"})
});

router.get("/delete_resource", (req, res, next) => {
  res.render("delete_resource", { title: "Delete one resource"})
});

module.exports = router;