const db = require("../../database");

exports.POST = (req, res) => {
  // Enforce authorization
  const usertype = req.user.type;
  const employeeid = req.user.employeeid;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const email_personal = req.body.email_personal;
  let smsphone = req.body.smsphone;
  const smsphonecountry = req.body.smsphonecountry;
  let phone = req.body.phone;
  const username = req.body.username;
  const password = req.body.password;

  // Validate

  if (!firstname.length)
    return res
      .status(400)
      .send({ msg: "first name is missing", msgType: "error" });

  if (!lastname.length)
    return res
      .status(400)
      .send({ msg: "last name is missing", msgType: "error" });

  if (!email.length)
    return res.status(400).send({ msg: "email is missing", msgType: "error" });

  if (!smsphone.length)
    return res
      .status(400)
      .send({ msg: "sms phone is missing", msgType: "error" });

  if (!smsphonecountry.length)
    return res
      .status(400)
      .send({ msg: "sms phone country is missing", msgType: "error" });

  const validatedSmsPhone = require("../utils").validatePhone(
    smsphone,
    smsphonecountry
  );
  if (!validatedSmsPhone.isPossibleNumber)
    return res
      .status(400)
      .send({ msg: "mobile phone number not valid", msgType: "error" });
  if (!validatedSmsPhone.isValidForRegion)
    return res.status(400).send({
      msg: "mobile phone number not valid for country",
      msgType: "error",
    });
  if (!validatedSmsPhone.isValidSmsType)
    return res.status(400).send({
      msg: "mobile phone number is not sms capable",
      msgType: "error",
    });
  smsphone = validatedSmsPhone.nationalFormat;

  if (phone.length) {
    const validatedPhone = require("../utils").validatePhone(phone, "us");
    if (validatedPhone.nationalFormat.length) {
      phone = validatedPhone.nationalFormat;
    }
  }

  if (!username.length)
    return res
      .status(400)
      .send({ msg: "username is missing", msgType: "error" });

  if (password.length) {
    // Validate password complexity
    const isValidPassword = require("../utils").validateNewPassword(password);
    if (!isValidPassword)
      return res.status(400).send({
        msg: "password lacks sufficient complexity",
        msgType: "error",
      });
  }

  const sql = `
    SELECT
      employeeid
    FROM
      employees
    WHERE
      username = ?
    AND
      employeeid <> ?
    LIMIT
      1
    ;
  `;
  db.query(sql, [username, employeeid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query to check for duplicate username",
        msgType: "error",
      });
    }

    if (result.length === 1)
      return res.status(400).send({
        msg: "username already taken",
        msgType: "error",
        duplicate: result[0].employeeid,
      });

    const sql = `
      SELECT
        employeeid
      FROM
        employees
      WHERE
        smsphone = ?
      AND
        employeeid <> ?
      LIMIT
        1
    `;
    db.query(sql, [smsphone, employeeid], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query to check for duplicate sms phone",
          msgType: "error",
        });
      }

      if (result.length === 1)
        return res
          .status(400)
          .send({ msg: "sms phone already taken", msgType: "error" });

      const sql = `
        SELECT
          employeeid
        FROM
          employees
        WHERE
          email = ?
        AND
          employeeid <> ?
        LIMIT
          1
        ;
      `;
      db.query(sql, [email, employeeid], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to query to check for duplicate email",
            msgType: "error",
          });
        }

        if (result.length === 1)
          return res
            .status(400)
            .send({ msg: "email is already taken", msgType: "error" });

        const sql = `
        UPDATE
          employees
        SET
          smsphone = ?,
          smsphonecountry = ?,
          firstname = ?,
          lastname = ?,
          email_personal = LCASE(?),
          phone = ?,
          username = LCASE(?)
        WHERE
          employeeid = ?
        ;
      `;
        db.query(
          sql,
          [
            smsphone,
            smsphonecountry,
            firstname,
            lastname,
            email_personal,
            phone,
            username,
            employeeid,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .send({ msg: "unable to update record", msgType: "error" });
            }

            res.status(200).send({
              msg: "record updated",
              msgType: "success",
              smsphoneNationalFormat: smsphone,
              phoneNationalFormat: phone,
            });

            // Update email and password separately because conditional logic in each one prevents using callbacks
            updateEmail(employeeid, email, usertype);
            updatePassword(employeeid, password);
          }
        );
      });
    });
  });
};

function updateEmail(employeeid, email, usertype) {
  const mayChangeEmail = ["director", "sysadmin"].includes(usertype) || false;

  if (!email.length) return;
  if (!mayChangeEmail) return;

  const sql = `
    UPDATE
      employees
    SET
      email = LCASE(?)
    WHERE
      employeeid = ?
    ;
  `;
  db.query(sql, [email, employeeid], (err, result) => {
    if (err) {
      console.log(err);
    }
  });
}

function updatePassword(employeeid, password) {
  if (!password.length) return;

  const bcrypt = require("bcrypt");
  const saltRounds = 10;

  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
      console.log(err);
    }
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        console.log(err);
      }

      const sql = `
        UPDATE
          employees
        SET
          password = ?
        WHERE
          employeeid = ?
      `;

      db.query(sql, [hash, employeeid], (err, result) => {
        if (err) {
          console.log(err);
        }
        console.log("Password updated");
      });
    });
  });
}
