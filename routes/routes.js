const express = require("express");
const router = express.Router();
const utils = require("./utils");
const authenticateToken = utils.authenticateToken;

const homePage = require("./controllers/homePage");
router.get("/", homePage.GET);

const helloWorld = require("./controllers/helloWorld");
router.get("/hello-world", helloWorld.GET);

module.exports = router;
