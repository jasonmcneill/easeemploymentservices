const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const utils = require("./utils");
const authenticateToken = utils.authenticateToken;

// SECURITY

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

const refreshToken = require("./controllers/refresh-token");
router.post("/api/refresh-token", refreshToken.POST);

// REGISTRATION

const register = require("./controllers/register");
router.post("/register", register.POST);

const registerConfirm = require("./controllers/register-confirm");
router.post("/register-confirm", registerConfirm.POST);

// PROFILE

const profile_view = require("./controllers/profile_view");
router.post("/api/profile-view", authenticateToken, profile_view.POST);

const profile_edit = require("./controllers/profile_edit");
router.post("/api/profile-edit", authenticateToken, profile_edit.POST);

// EMPLOYEES

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

// TIME ENTRIES

const timeentries_employee = require("./controllers/timeentries_employee");
router.post(
  "/api/timeentries/employee",
  authenticateToken,
  timeentries_employee.POST
);

const timeentries_today = require("./controllers/timeentries_today");
router.post(
  "/api/timeentries-today",
  authenticateToken,
  timeentries_today.POST
);

const timeentry_in = require("./controllers/timeentry_in");
router.post("/api/timeentry-in", authenticateToken, timeentry_in.POST);

const timeentry_out = require("./controllers/timeentry_out");
router.post("/api/timeentry-out", authenticateToken, timeentry_out.POST);

const timeentry_delete = require("./controllers/timeentry_delete");
router.post("/api/timeentry-delete", authenticateToken, timeentry_delete.POST);

const timeentry_update = require("./controllers/timeentry_update");
router.post("/api/timeentry-update", authenticateToken, timeentry_update.POST);

// PARTICIPANTS

const participant_view = require("./controllers/participant_view");
router.post("/api/participant-view", authenticateToken, participant_view.POST);

const participants_list = require("./controllers/participants_list");
router.get("/api/participants-list", authenticateToken, participants_list.GET);

const participants_overview = require("./controllers/participants_overview");
router.get(
  "/api/participants-overview",
  authenticateToken,
  participants_overview.GET
);

const participant_search = require("./controllers/participant_search");
router.post(
  "/api/participant-search",
  authenticateToken,
  participant_search.POST
);

const participant_add = require("./controllers/participant_add");
router.post("/api/participant-add", authenticateToken, participant_add.POST);

const participant_delete = require("./controllers/participant_delete");
router.post(
  "/api/participant-delete",
  authenticateToken,
  participant_delete.POST
);

const participant_edit = require("./controllers/participants_edit");
router.post("/api/participant-edit", authenticateToken, participant_edit.POST);

const participants_of_user = require("./controllers/participants_of_user");
router.get(
  "/api/participants-of-user",
  authenticateToken,
  participants_of_user.GET
);

const participants_of_employee = require("./controllers/participants_of_employee");
router.post(
  "/api/participants-of-employee",
  authenticateToken,
  participants_of_employee.POST
);

// EMPLOYERS

const employer_list = require("./controllers/employer_list");
router.get("/api/employer-list", authenticateToken, employer_list.GET);

const employer_add = require("./controllers/employer_add");
router.post("/api/employer-add", authenticateToken, employer_add.POST);

const employer_view = require("./controllers/employer_view");
router.get("/api/employer/:id", employer_view.GET);

const employer_delete = require("./controllers/employer_delete");
router.post("/api/employer-delete", authenticateToken, employer_delete.POST);

const employer_edit = require("./controllers/employer_edit");
router.post("/api/employer-edit", authenticateToken, employer_edit.POST);

// JOBS

const job_add = require("./controllers/job_add");
router.post("/api/job-add", authenticateToken, job_add.POST);

const jobs_list = require("./controllers/jobs_list");
router.post("/api/jobs-list", authenticateToken, jobs_list.POST);

const jobs_placed = require("./controllers/jobs_placed");
router.post("/api/jobs-placed", authenticateToken, jobs_placed.POST);

const job_view = require("./controllers/job_view");
router.post("/api/job", authenticateToken, job_view.POST);

const job_full = require("./controllers/job_full");
router.get("/api/job-full/:id", authenticateToken, job_full.GET);

const job_delete = require("./controllers/job_delete");
router.post("/api/job-delete", authenticateToken, job_delete.POST);

const job_edit = require("./controllers/job_edit");
router.post("/api/job-edit", authenticateToken, job_edit.POST);

// HOUSING PROVIDERS

const provider_list = require("./controllers/provider_list");
router.get("/api/provider-list", authenticateToken, provider_list.GET);

const provider_add = require("./controllers/provider_add");
router.post("/api/provider-add", authenticateToken, provider_add.POST);

const provider_view = require("./controllers/provider_view");
router.get("/api/provider/:id", provider_view.GET);

const provider_delete = require("./controllers/provider_delete");
router.post("/api/provider-delete", authenticateToken, provider_delete.POST);

const provider_edit = require("./controllers/provider_edit");
router.post("/api/provider-edit", authenticateToken, provider_edit.POST);

// HOMES

const home_add = require("./controllers/home_add");
router.post("/api/home-add", authenticateToken, home_add.POST);

const homes_list = require("./controllers/homes_list");
router.post("/api/homes-list", authenticateToken, homes_list.POST);

const homes_placed = require("./controllers/homes_placed");
router.post("/api/homes-placed", authenticateToken, homes_placed.POST);

const home_view = require("./controllers/home_view");
router.post("/api/home", authenticateToken, home_view.POST);

const home_full = require("./controllers/home_full");
router.get("/api/home-full/:id", authenticateToken, home_full.GET);

const home_delete = require("./controllers/home_delete");
router.post("/api/home-delete", authenticateToken, home_delete.POST);

const home_edit = require("./controllers/home_edit");
router.post("/api/home-edit", authenticateToken, home_edit.POST);

// JOB PLACEMENTS

const job_placements_of_participant = require("./controllers/job_placements_of_participant");
router.post(
  "/api/job-placements-of-participant",
  authenticateToken,
  job_placements_of_participant.POST
);

// HOUSING PLACEMENTS

const housing_placements_of_participant = require("./controllers/housing_placements_of_participant");
router.post(
  "/api/housing-placements-of-participant",
  authenticateToken,
  housing_placements_of_participant.POST
);

// CASE NOTES
const uploadDir = path.join(__dirname, "../casenotes");
const upload = multer({ dest: uploadDir });

const case_notes_view = require("./controllers/case_notes_view");
router.post("/api/case-notes-view", authenticateToken, case_notes_view.POST);

const case_notes_upload = require("./controllers/case_notes_upload");
router.post(
  "/api/case_notes_upload",
  [authenticateToken, upload.single("file")],
  case_notes_upload.POST
);

// REPORTS

const report_capacity_supported_employment = require("./controllers/report_capacity_supported_employment");
router.post(
  "/api/report_capacity_supported_employment",
  authenticateToken,
  report_capacity_supported_employment.POST
);

const report_capacity_supportive_housing = require("./controllers/report_capacity_supportive_housing");
router.post(
  "/api/report_capacity_supportive_housing",
  authenticateToken,
  report_capacity_supportive_housing.POST
);

// EXPORT

module.exports = router;
