const express = require("express");
const router = express.Router();
const utils = require("./utils");
const authenticateToken = utils.authenticateToken;

const homePage = require("./controllers/homePage");
router.get("/", homePage.GET);

const login = require("./controllers/login");
router.get("/login", login.GET);
router.post("/login", login.POST);

module.exports = router;
