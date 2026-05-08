const express = require("express");

const router = express.Router();

const {
  getRecommendation,
} = require("../controllers/recommendation.controller");

router.post("/", getRecommendation);

module.exports = router;