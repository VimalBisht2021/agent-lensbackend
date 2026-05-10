const express = require("express");

const router = express.Router();

const {
  enhancePrompt,
} = require(
  "../controllers/prompt.controller"
);

router.post(
  "/enhance",
  enhancePrompt
);

module.exports = router;