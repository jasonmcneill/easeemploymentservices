exports.POST = (req, res) => {
  const moment = require("moment");
  const db = require("../../database");
  const defaultUsers = require("../../defaults.json");
  const firstname = req.body.firstname || "";
  const lastname = req.body.lastname || "";
  const email = req.body.email || "";
  let smsphone = req.body.smsphone || "";
  const smsphonecountry = req.body.smsphonecountry;
  const username = req.body.username || "";
  const password = req.body.password || "";
  const token = req.body.token || "";
  let protocol;
  let host;

  switch (process.env.ENV) {
    case "development":
      protocol = "http:";
      host = "localhost:3000";
      break;
    case "staging":
      protocol = "https:";
      host = "staging-access.easeemploymentservices.com";
      break;
    case "production":
      protocol = "https:";
      host = "access.easeemploymentservices.com";
      break;
  }

  // Validate missing data
  if (!firstname.length)
    return res
      .status(400)
      .send({ msg: "missing first name", msgType: "error" });
  if (!lastname.length)
    return res.status(400).send({ msg: "missing last name", msgType: "error" });
  if (!email.length)
    return res.status(400).send({ msg: "missing e-mail", msgType: "error" });
  if (!username.length)
    return res.status(400).send({ msg: "missing username", msgType: "error" });
  if (!password.length)
    return res.status(400).send({ msg: "missing password", msgType: "error" });

  // Check eligibility to register (key on e-mail address)
  const sql = `
    SELECT 
      token, 
      expiry,
      employeeid
    FROM 
      tokens 
    WHERE 
      token = ? 
    AND 
      expiry > utc_timestamp() 
    LIMIT 
      1
    ;
  `;
  db.query(sql, [token], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for eligibility",
        msgType: "error",
        error: err,
      });
    }

    if (!result.length) {
      return res
        .status(400)
        .send({ msg: "not eligible to register", msgType: "error" });
    }

    const employeeid = result[0].employeeid;

    // Check if e-mail is already in use by another user
    const sql =
      "SELECT employeeid FROM employees WHERE email = ? AND employeeid <> ?;";

    db.query(sql, [email, employeeid], (err, result) => {
      if (err) {
        console.log(error);
        return res.status(500).send({
          msg: "unable to query for duplicate e-mail",
          msgType: "error",
          error: err,
        });
      }

      if (result.length) {
        return res
          .status(400)
          .send({ msg: "e-mail address is taken", msgType: "error" });
      }

      // Validate SMS phone
      if (smsphone.length) {
        const validatedPhone = require("../utils").validatePhone(
          smsphone,
          smsphonecountry
        );
        if (!validatedPhone.isPossibleNumber)
          return res
            .status(400)
            .send({ msg: "mobile phone number not valid", msgType: "error" });
        if (!validatedPhone.isValidForRegion)
          return res.status(400).send({
            msg: "mobile phone number not valid for country",
            msgType: "error",
          });
        if (!validatedPhone.isValidSmsType)
          return res.status(400).send({
            msg: "mobile phone number is not sms capable",
            msgType: "error",
          });
        smsphone = validatedPhone.nationalFormat;
      }

      // Check DB for duplicate usernames
      const sql =
        "SELECT employeeid FROM employees WHERE username = ? LIMIT 1;";
      db.query(sql, [username], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to query for username",
            msgType: "error",
            error: err,
          });
        }
        if (result.length === 1)
          return res
            .status(400)
            .send({ msg: "username is taken", msgType: "error" });

        // Validate password complexity
        const isValidPassword = require("../utils").validateNewPassword(
          password
        );
        if (!isValidPassword)
          return res.status(400).send({
            msg: "password lacks sufficient complexity",
            msgType: "error",
          });

        // Check DB for duplicate SMS phone numbers
        const sql =
          "SELECT employeeid FROM employees WHERE smsphone = ? AND employeeid <> ? LIMIT 1;";
        db.query(sql, [smsphone, employeeid], (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "unable to query for sms phone",
              msgType: "error",
              error: err,
            });
          }
          if (result.length === 1)
            return res
              .status(400)
              .send({ msg: "sms phone is taken", msgType: "error" });

          // Determine user type
          let usertype = "regular";
          let isDefaultUser = false;
          defaultUsers.users.sysadmins.forEach((item) => {
            if (item.email == email) {
              usertype = "sysadmin";
              isDefaultUser = true;
            }
          });
          defaultUsers.users.directors.forEach((item) => {
            if (item.email == email) {
              usertype = "director";
              isDefaultUser = true;
            }
          });

          const bcrypt = require("bcrypt");
          const saltRounds = 10;

          // Hash the password
          bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
              console.log(err);
              return res.status(500).send({
                msg: "unable to generate password salt",
                msgType: "error",
                error: err,
              });
            }
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) {
                console.log(err);
                return res.status(500).send({
                  msg: "unable to generate password hash",
                  msgType: "error",
                  error: err,
                });
              }

              const sql = `
                SELECT
                  employeeid
                FROM
                  employees
                WHERE
                  email = ?
                LIMIT
                  1
                ;
              `;

              db.query(sql, [email], (err, result) => {
                if (err) {
                  console.log(err);
                  return res.status(500).send({ msg: "unable to check for existing record based on e-mail address", msgType: "error" });
                }

                let sql;
                let sqlVariables;
                let insertedEmployeeId = 0;

                if (result.length) {
                  insertedEmployeeId = result[0].employeeid;
                  sql = `
                    UPDATE employees
                    SET
                      email = ?,
                      smsphone = ?,
                      smsphonecountry = ?,
                      firstname = ?,
                      lastname = ?,
                      type = ?,
                      username = LCASE(?),
                      password = ?,
                      createdAt = utc_timestamp()
                    WHERE employeeid = ?;
                    ;
                  `;
                  sqlVariables = [
                    email.toLowerCase(),
                    smsphone,
                    smsphonecountry,
                    firstname,
                    lastname,
                    usertype,
                    username.toLowerCase(),
                    hash,
                    insertedEmployeeId
                  ];
                } else {
                  sql = `
                    INSERT INTO employees(
                      email,
                      smsphone,
                      smsphonecountry,
                      firstname,
                      lastname,
                      type,
                      username,
                      password,
                      createdAt
                    ) VALUES(
                      ?, ?, ?, ?, ?, ?, ?, ?, utc_timestamp()
                    );
                  `;
                  sqlVariables = [
                    email.toLowerCase(),
                    smsphone,
                    smsphonecountry,
                    firstname,
                    lastname,
                    usertype,
                    username.toLowerCase(),
                    hash,
                  ];
                }

                db.query(sql, sqlVariables, (err, result) => {
                  if (err) {
                    console.log(err);
                    return res.status(500).send({ msg: "unable to insert new user", msgType: "error" });
                  }

                  if (isDefaultUser) {
                    insertedEmployeeId = result.insertId;
                  }

                  const registrationToken = require("crypto")
                    .randomBytes(32)
                    .toString("hex");

                  const expiry = moment()
                    .add(15, "days")
                    .format("YYYY-MM-DD HH:mm:ss");

                  const sql = `
                    INSERT INTO tokens(
                      token,
                      expiry,
                      purpose,
                      employeeid,
                      createdAt
                    ) VALUES (
                      ?, ?, 'registration', ?, utc_timestamp()
                    );
                  `;
                  db.query(
                    sql,
                    [registrationToken, expiry, insertedEmployeeId],
                    (err, result) => {
                      if (err) {
                        console.log(err);
                        return res.status(500).send({
                          msg: "unable to insert registration token",
                          msgType: "error",
                          error: err,
                        });
                      }

                      const utils = require("../utils");
                      const sendEmail = utils.sendEmail;
                      const messageID = require("uuid").v4();
                      const confirmationUrl = `${protocol}//${host}/register-confirm/#token=${registrationToken}`;
                      const recipient = `${firstname} ${lastname} <${email}>`;
                      const emailSenderText = "E.A.S.E.";
                      const subject = "Confirm your registration";
                      const body = `
                          <p>
                            This message is for ${firstname} ${lastname}. In order to complete your registration, please click on the link below:
                          </p>
                          <p style="margin: 30px 0">
                            <strong><big>
                              <a href="${confirmationUrl}" style="text-decoration: underline">
                                Confirm my registration
                              </a>
                            </big></strong>
                          </p>
                          <p>E.A.S.E. Employment Services</p>
                          <div style="margin: 40px 0 20px 0">
                            <small><small style="color: #ccc">
                              <hr size="1" color="#ccc" />
                              Message ID: ${messageID.toUpperCase()}
                            </small></small>
                          </div>
                      `;

                      sendEmail(recipient, emailSenderText, subject, body)
                        .then((result) => {
                          return res.status(200).send({
                            msg: "confirmation e-mail sent",
                            msgType: "success",
                            result: result,
                          });
                        })
                        .catch((error) => {
                          console.log(
                            require("util").inspect(error, true, 7, true)
                          );
                          return res.status(500).send({
                            msg: "confirmation e-mail could not be sent",
                            msgType: "error",
                            error: error,
                          });
                        });
                    }
                  );
                });
              });
            });
          });
        });
      });
    });
  });
};
