const { sendEmail } = require("../utils");

exports.POST = (req, res) => {
  const db = require("../../database");
  const firstname = req.body.firstname || "";
  const lastname = req.body.lastname || "";
  const email = req.body.email || "";
  let smsphone = req.body.smsphone || "";
  const smsphonecountry = req.body.smsphonecountry;
  const username = req.body.username || "";
  const password = req.body.password || "";
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
  const sql = "SELECT employeeid FROM employees WHERE username = ? LIMIT 1;";
  db.query(sql, [username], (err, result) => {
    if (err)
      return res
        .status(500)
        .send({ msg: "unable to query for username", msgType: "error" });
    if (result.length === 1)
      return res
        .status(400)
        .send({ msg: "username is taken", msgType: "error" });

    // Validate password complexity
    const isValidPassword = require("../utils").validateNewPassword(password);
    if (!isValidPassword)
      return res.status(400).send({
        msg: "password lacks sufficient complexity",
        msgType: "error",
      });

    // Check DB for duplicate emails
    const sql = "SELECT employeeid FROM employees WHERE email = ? LIMIT 1;";
    db.query(sql, [email], (err, result) => {
      if (err)
        return res
          .status(500)
          .send({ msg: "unable to query for e-mail", msgType: "error" });
      if (result.length === 1)
        return res
          .status(400)
          .send({ msg: "e-mail address is taken", msgType: "error" });

      // Check DB for duplicate SMS phone numbers
      const sql =
        "SELECT employeeid FROM employees WHERE smsphone = ? LIMIT 1;";
      db.query(sql, [smsphone], (err, result) => {
        if (err)
          return res
            .status(500)
            .send({ msg: "unable to query for sms phone", msgType: "error" });
        if (result.length === 1)
          return res
            .status(400)
            .send({ msg: "sms phone is taken", msgType: "error" });

        // Determine user type
        let usertype = "regular";
        const defaultUsers = JSON.parse(require("../../defaults.json"));
        defaultUsers.users.sysadmins.forEach((item) => {
          if (item.email === email) role = "sysadmin";
        });
        defaultUsers.users.directors.forEach((item) => {
          if (item.email === email) role = "director";
        });

        const bcrypt = require("bcrypt");
        const saltRounds = 10;

        // Hash the password
        bcrypt.genSalt(saltRounds, (err, salt) => {
          if (err)
            return res.status(500).send({
              msg: "unable to generate password salt",
              msgType: "error",
            });
          bcrypt.hash(newPassword, salt, (err, hash) => {
            if (err)
              return res.status(500).send({
                msg: "unable to generate password hash",
                msgType: "error",
              });

            // Insert the new record
            const moment = require("moment");
            const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
            const sql = `
              INSERT INTO employees(
                email,
                smsphone,
                firstname,
                lastname,
                type,
                username,
                password,
                createdAt
              ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?
              )
            ;`;

            db.query(
              sql,
              [
                email,
                smsphone,
                firstname,
                lastname,
                usertype,
                username,
                hash,
                createdAt,
              ],
              (err, result) => {
                if (err)
                  return res.status(500).send({
                    msg: "unable to insert new user",
                    msgType: "error",
                  });

                const insertedEmployeeId = result.insertId;

                const registrationToken = require("crypto")
                  .randomBytes(32)
                  .toString("hex");

                const expiry = moment()
                  .add(20, "minutes")
                  .format("YYYY-MM-DD HH:mm:ss");

                const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");

                const sql = `
                  INSERT INTO tokens(
                    token,
                    expiry,
                    purpose,
                    employeeid,
                    createdAt
                  ) VALUES (
                    ?, ?, 'registration', ?, ?
                  );`;

                db.query(
                  sql,
                  [registrationToken, expiry, insertedEmployeeId, createdAt],
                  (err, result) => {
                    if (err)
                      return res.status(500).send({
                        msg: "unable to insert registration token",
                        msgType: "error",
                      });

                    const sendEmail = require("../utils").sendEmail;
                    const messageID = require("uuid").v4();
                    const confirmationUrl = `${protocol}//${host}/register-confirm/#token=${registrationToken}`;
                    const recipient = `${firstname} ${lastname} <${email}>`;
                    const sender = `E.A.S.E. <no-reply@access.easeemploymentservices.com>`;
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
                  }
                );

                sendEmail(recipient, sender, subject, body)
                  .then((result) => {
                    return res.status(result[0].statusCode || 200).send({
                      msg: "confirmation e-mail sent",
                      msgType: "success",
                    });
                  })
                  .catch((error) => {
                    console.log(error);
                    return res.status(500).send({
                      msg: "confirmation e-mail could not be sent",
                      msgType: "error",
                    });
                  });
              }
            );
          });
        });
      });
    });
  });

  // TODO:  Populate DB with registration token & expiry
  // TODO:  Send e-mail with registration token

  return res
    .status(200)
    .send({ msg: "confirmation e-mail sent", msgType: "success" });
};
