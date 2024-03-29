const moment = require("moment");
const db = require("../../database");

exports.POST = (req, res) => {
  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["sysadmin", "director"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid}) is not authorized.`);
    return res.status(401).send({
      msg: "user is not authorized for this action",
      msgType: "error",
    });
  }

  const participantid = parseInt(req.body.participantid) || "";
  const firstname = req.body.firstname || "";
  const lastname = req.body.lastname || "";
  const phone = req.body.phone || "";
  const phonecountry = req.body.phonecountry || "";
  const address = req.body.address || "";
  const city = req.body.city || "";
  const state = req.body.state || "";
  const zip = req.body.zip || "";
  const authorizationdate = req.body.authorizationdate || "";
  const employeeid = parseInt(req.body.employeeid) || null;
  const caseworkeremployment = parseInt(req.body.caseworkeremployment) || null;
  const caseworkerhousing = parseInt(req.body.caseworkerhousing) || null;
  const needsEmployment = req.body.needsEmployment ? 1 : 0;
  const needsHousing = req.body.needsHousing ? 1 : 0;

  // Validate

  if (typeof participantid !== "number") {
    return res
      .send(400)
      .send({ msg: "invalid participant id", msgType: "error" });
  }

  if (!firstname.length) {
    return res
      .send(400)
      .send({ msg: "first name is missing", msgType: "error" });
  }

  if (!lastname.length) {
    return res
      .send(400)
      .send({ msg: "last name is missing", msgType: "error" });
  }

  if (!city.length) {
    return res.send(400).send({ msg: "city is missing", msgType: "error" });
  }

  if (!state.length) {
    return res.send(400).send({ msg: "state is missing", msgType: "error" });
  }

  // Validate authorization date
  if (!authorizationdate.length)
    return res
      .status(400)
      .send({ msg: "missing authorization date", msgType: "error" });
  const isValidAuthorizationDate = moment(authorizationdate).isValid() || false;
  if (!isValidAuthorizationDate)
    return res
      .status(400)
      .send({ msg: "invalid authorization date", msgType: "error" });

  // Validate phone number
  const validatePhone = require("../utils").validatePhone;
  let phoneValidated = phone.replace(/\D/g, "");
  if (phoneValidated != "") {
    if (phonecountry === "") {
      return res.status(400).send({
        msg: "phone country required if phone is not blank",
        msgType: "error",
      });
    }

    const phoneValidation = validatePhone(phoneValidated, phonecountry);
    if (!phoneValidation.isPossibleNumber) {
      return res
        .status(400)
        .send({ msg: "invalid phone number", msgType: "error" });
    }
    if (!phoneValidation.isValidForRegion) {
      return res
        .status(400)
        .send({ msg: "invalid phone number for region", msgType: "error" });
    }
    phoneValidated = phoneValidation.nationalFormat;
  }

  // Update participant
  const sql = `
    UPDATE
      participants
    SET
      firstname = ?,
      lastname = ?,
      phone = ?,
      phonecountry = ?,
      address = ?,
      city = ?,
      state = UCASE(?),
      zip = ?,
      authorizationdate = ?,
      seekshousing = ?,
      seeksemployment = ?,
      employeeid = ?,
      caseworkeremployment = ?,
      caseworkerhousing = ?
    WHERE
      participantid = ?
    ;
  `;
  const updatedEmployeeId = typeof employeeid === "number" ? employeeid : null;
  const updatedCaseWorkerEmployment =
    typeof caseworkeremployment === "number" ? caseworkeremployment : null;
  const updatedCaseWorkerHousing =
    typeof caseworkerhousing === "number" ? caseworkerhousing : null;
  db.query(
    sql,
    [
      firstname,
      lastname,
      phone,
      phonecountry,
      address,
      city,
      state,
      zip,
      moment(authorizationdate).format("YYYY-MM-DD"),
      needsHousing,
      needsEmployment,
      updatedEmployeeId,
      updatedCaseWorkerEmployment,
      updatedCaseWorkerHousing,
      participantid,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .send({ msg: "unable to update participant", msgType: "error" });
      }
      return res
        .status(200)
        .send({ msg: "participant updated", msgType: "success" });
    }
  );
};
