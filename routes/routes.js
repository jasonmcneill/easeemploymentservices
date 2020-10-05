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

const passwordMustChange = require("./controllers/password-must-change");
router.post(
  "/api/password-must-change",
  authenticateToken,
  passwordMustChange.POST
);

const register = require("./controllers/register");
router.post("/register", register.POST);

const registerConfirm = require("./controllers/register-confirm");
router.post("/register-confirm", registerConfirm.POST);

const refreshToken = require("./controllers/refresh-token");
router.post("/api/refresh-token", refreshToken.POST);

const employees_list = require("./controllers/employees_list");
router.get(
  "/api/employee/employees-list",
  authenticateToken,
  employees_list.GET
);

const employee_view = require("./controllers/employee_view");
router.get("/api/employee/:id", authenticateToken, employee_view.GET);

const employee_edit = require("./controllers/employee_edit");
router.post("/api/employee/edit/:id", authenticateToken, employee_edit.POST);

const employee_add = require("./controllers/employee_add");
router.post("/api/employee/add/", authenticateToken, employee_add.POST);

const employee_delete = require("./controllers/employee_delete");
router.post("/api/employee/delete", authenticateToken, employee_delete.POST);

const timeentries_list = require("./controllers/timeentries_list");
router.post("/api/timeentries-list", authenticateToken, timeentries_list.POST);

const timeentry_in = require("./controllers/timeentry_in");
router.post("/api/timeentry-in", authenticateToken, timeentry_in.POST);

module.exports = router;
