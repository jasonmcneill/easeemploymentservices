const { stringify } = require("uuid");
const db = require("../../database");

exports.LIST = (req, res) => {
  const sql =
    "SELECT employeeid, firstname, lastname FROM employees WHERE status = 'registered' ORDER BY lastname, firstname;";

  db.query(sql, [], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for employees", msgType: "error" });
    }

    return res.status(200).send(results);
  });
};

exports.EMPLOYEE = (req, res) => {
  const employeeid = req.params.id;
  const sql = `
    SELECT
      employeeid,
      email,
      email_personal,
      phone,
      smsphone,
      smsphonecountry,
      firstname,
      lastname,
      type,
      status,
      username,
      passwordmustchange,
      startdate,
      enddate,
      createdAt,
      updatedAt
    FROM employees
    WHERE employeeid = ?;
  `;

  db.query(sql, [employeeid], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for employee", msgType: "error" });
    }

    if (!result.length)
      return res
        .status(404)
        .send({ msg: "employee not found", msgType: "error" });

    return res.status(200).send(result);
  });
};

exports.UPDATE = (req, res) => {
  const moment = require("moment");
  const employeeid = parseInt(req.body.employeeid) || "";
  const firstname = req.body.firstname || "";
  const lastname = req.body.lastname || "";
  const type = req.body.type || "";
  const status = req.body.status || "";
  const username = req.body.username || "";
  const passwordmustchange = req.body.passwordmustchange == 1 ? 1 : 0;
  const email = req.body.email || "";
  const email_personal = req.body.email_personal || "";
  let smsphone = req.body.smsphone || "";
  const smsphonecountry = req.body.smsphonecountry || "";
  let phone = req.body.phone || "";
  let startdate = req.body.startdate || null;
  let enddate = req.body.enddate || null;

  // VALIDATION
  const emailValidator = require("email-validator");
  const validatePhone = require("../utils").validatePhone;
  const validatedSmsPhone = smsphone.length
    ? validatePhone(smsphone, smsphonecountry)
    : false;
  const validatedPhone = phone.length ? validatePhone(phone, "us") : false;

  if (typeof employeeid !== "number")
    return res
      .status(400)
      .send({ msg: "invalid employeeid", msgType: "error" });

  if (!firstname.length)
    return res
      .status(400)
      .send({ msg: "first name missing", msgType: "error" });

  if (!lastname.length)
    return res.status(400).send({ msg: "last name missing", msgType: "error" });

  if (!["regular", "sysadmin", "director"].includes(type))
    return res
      .status(400)
      .send({ msg: "invalid employee type", msgType: "error" });

  if (!["pending", "registered", "frozen"].includes(status))
    return res
      .status(400)
      .send({ msg: "invalid employee status", msgType: "error" });

  if (!username.length)
    return res.status(400).send({ msg: "username missing", msgType: "error" });

  if (!email.length)
    return res.status(400).send({ msg: "email missing", msgType: "error" });

  if (!emailValidator.validate(email))
    return res.status(400).send({ msg: "email invalid", msgType: "error" });

  if (email_personal.length && !emailValidator.validate(email_personal))
    return res
      .status(400)
      .send({ msg: "personal email invalid", msgType: "error" });

  if (!smsphonecountry.length)
    return res
      .status(400)
      .send({ msg: "smsphonecountry missing", msgType: "error" });

  if (validatedSmsPhone && !validatedSmsPhone.isPossibleNumber)
    return res.status(400).send({ msg: "invalid smsphone", msgType: "error" });

  if (validatedSmsPhone && !validatedSmsPhone.isValidForRegion)
    return res
      .status(400)
      .send({ msg: "invalid smsphone for selected country", msgType: "error" });

  if (validatedSmsPhone && !validatedSmsPhone.isValidSmsType)
    return res
      .status(400)
      .send({ msg: "smsphone is not compatible with sms", msgType: "error" });

  if (validatedPhone && !validatedPhone.isPossibleNumber)
    return res.status(400).send({ msg: "invalid phone", msgType: "error" });

  smsphone = validatedSmsPhone.nationalFormat.length
    ? validatedSmsPhone.nationalFormat
    : "";

  phone = validatedPhone.nationalFormat.length
    ? validatedPhone.nationalFormat
    : "";

  startdate =
    typeof startdate === "string" && startdate.length
      ? moment(startdate).format("YYYY-MM-DD")
      : null;
  enddate =
    typeof enddate === "string" && enddate.length
      ? moment(enddate).format("YYYY-MM-DD")
      : null;

  const sql = `
    UPDATE employees
    SET
      firstname = ?,
      lastname = ?,
      type = ?,
      status = ?,
      username = ?,
      passwordmustchange = ?,
      email = ?,
      email_personal = ?,
      smsphone = ?,
      smsphonecountry = ?,
      phone = ?,
      startdate = ?,
      enddate = ?
    WHERE employeeid = ?
  `;

  db.query(
    sql,
    [
      firstname,
      lastname,
      type,
      status,
      username,
      passwordmustchange,
      email,
      email_personal,
      smsphone,
      smsphonecountry,
      phone,
      startdate,
      enddate,
      employeeid,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .send({ msg: "unable to execute update query", msgType: "error" });
      }

      return res
        .status(200)
        .send({ msg: "employee updated", msgType: "success" });
    }
  );
};
