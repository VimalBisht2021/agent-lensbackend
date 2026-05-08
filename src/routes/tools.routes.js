const express = require("express");

const router = express.Router();

const {
  getAllTools,
  getToolsByCategory,
  compareTools,
} = require("../controllers/tools.controller");

router.get("/", getAllTools);

router.get("/category/:category", getToolsByCategory);

router.post("/compare", compareTools);

module.exports = router;