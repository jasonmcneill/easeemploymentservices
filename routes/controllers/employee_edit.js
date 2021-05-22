const db = require("../../database");

exports.POST = (req, res) => {
  const moment = require("moment");
  const employeeid = parseInt(req.body.employeeid) || "";
  const firstname = req.body.firstname || "";
  const lastname = req.body.lastname || "";
  const type = req.body.type || "";
  const username = req.body.username || "";
  const passwordmustchange = req.body.passwordmustchange == 1 ? 1 : 0;
  const email = req.body.email || "";
  let email_personal = req.body.email_personal || "";
  let smsphone = req.body.smsphone || "";
  const smsphonecountry = req.body.smsphonecountry || "";
  let phone = req.body.phone || "";
  let startdate = req.body.startdate || null;
  let enddate = req.body.enddate || null;

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

  // Validation
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

  if (!username.length)
    return res.status(400).send({ msg: "username missing", msgType: "error" });

  if (!email.length)
    return res.status(400).send({ msg: "email missing", msgType: "error" });

  if (!emailValidator.validate(email))
    return res.status(400).send({ msg: "email invalid", msgType: "error" });

  if (email_personal.length && !emailValidator.validate(email_personal)) {
    return res
      .status(400)
      .send({ msg: "personal email invalid", msgType: "error" });
  } else if (email_personal.length === 0) {
    email_personal = null;
  } else {
    email_personal = email_personal.trim().toLowerCase();
  }

  if (!smsphonecountry.length)
    return res
      .status(400)
      .send({ msg: "smsphonecountry missing", msgType: "error" });

  if (validatedSmsPhone && !validatedSmsPhone.isPossibleNumber)
    return res.status(400).send({
      msg: "invalid smsphone",
      msgType: "error",
      validatedSmsPhone: validatedSmsPhone,
    });

  if (validatedSmsPhone && !validatedSmsPhone.isValidForRegion)
    return res.status(400).send({
      msg: "invalid smsphone for selected country",
      msgType: "error",
      validatedSmsPhone: validatedSmsPhone,
    });

  if (validatedSmsPhone && !validatedSmsPhone.isValidSmsType)
    return res.status(400).send({
      msg: "smsphone is not compatible with sms",
      msgType: "error",
      validatedSmsPhone: validatedSmsPhone,
    });

  if (validatedPhone && !validatedPhone.isPossibleNumber)
    return res.status(400).send({
      msg: "invalid phone",
      msgType: "error",
      validatedSmsPhone: validatedSmsPhone,
    });

  smsphone = validatedSmsPhone.nationalFormat
    ? validatedSmsPhone.nationalFormat
    : "";

  phone = validatedPhone.nationalFormat ? validatedPhone.nationalFormat : "";

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
      username = LCASE(?),
      passwordmustchange = ?,
      email = LCASE(?),
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
