const express = require("express");
const router = express.Router();
const utils = require("./utils");
const authenticateToken = utils.authenticateToken;

const homePage = require("./controllers/homePage");
router.get("/", homePage.GET);

module.exports = router;
