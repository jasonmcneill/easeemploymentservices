const express = require("express");
const router = express.Router();
const utils = require("./utils");
const authenticateToken = utils.authenticateToken;

const login = require("./controllers/login");
router.post("/login", login.POST);

const forgotPassword = require("./controllers/forgot-password");
router.post("/forgot-password", forgotPassword.POST);

const resetPassword = require("./controllers/reset-password");
router.post("/reset-password", resetPassword.POST);

const register = require("./controllers/register");
router.post("/register", register.POST);

const registerConfirm = require("./controllers/register-confirm");
router.post("/register-confirm", registerConfirm.POST);

const refreshToken = require("./controllers/refresh-token");
router.post("/api/refresh-token", refreshToken.POST);

const employees = require("./controllers/employees");
router.get("/api/employee/employees-list", authenticateToken, employees.LIST);
router.get("/api/employee/:id", authenticateToken, employees.EMPLOYEE);
router.post("/api/employee/edit/:id", employees.UPDATE);
router.post("/api/employee/add/", employees.ADD);

module.exports = router;
