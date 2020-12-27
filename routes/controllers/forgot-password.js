exports.POST = (req, res) => {
  const db = require("../../database");
  const email = req.body.email || "";
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
  const validator = require("email-validator");
  const isValidEmail = validator.validate(email);

  if (!isValidEmail)
    return res.status(400).send({
      msg: "invalid e-mail format",
      msgType: "error",
    });

  const sql = `SELECT 
      e.employeeid,
      e.firstname, 
      e.lastname, 
      e.email,
      e.username,
      t.token,
      t.expiry
    FROM employees e
    LEFT OUTER JOIN tokens t ON t.employeeid = e.employeeid
    WHERE e.email = ?
    LIMIT 1;`;
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for email", msgType: "error" });
    }
    if (!result.length)
      return res.status(404).send({ msg: "user not found", msgType: "error" });
    const moment = require("moment");
    const employeeid = result[0].employeeid;
    const username = result[0].username;
    const firstname = result[0].firstname;
    const lastname = result[0].lastname;
    const recipientEmail = result[0].email;
    let resetToken = require("crypto").randomBytes(32).toString("hex");
    const timeSent = moment();
    const createdAt = timeSent.format("YYYY-MM-DD HH:mm:ss");
    const passwordResetExpiry = moment().add(20, "minutes");
    const passwordResetExpiryMySQL = passwordResetExpiry.format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const tokenInDatabase = result[0].token || "";
    const expiryInDatabase = result[0].expiry || "";
    const expiryStillInTheFuture = expiryInDatabase.length
      ? timeSent.isBefore(expiryInDatabase)
      : false;
    if (expiryStillInTheFuture && tokenInDatabase.length)
      resetToken = tokenInDatabase;

    const sql =
      "INSERT INTO tokens(token, expiry, purpose, employeeid, createdAt) VALUES (?, ?, 'password reset', ?, ?);";
    db.query(
      sql,
      [resetToken, passwordResetExpiryMySQL, employeeid, createdAt],
      (err, result2) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to update employee record",
            msgType: "error",
          });
        }
        const uuid = require("uuid");
        const messageID = uuid.v4();
        const utils = require("../utils");
        const resetUrl = `${protocol}//${host}/reset-password#token=${resetToken}`;
        const emailSenderText = "E.A.S.E.";
        const subject = "Reset your password";
        const body = `
          <p>This message is for ${firstname} ${lastname}. We just received your request to reset your password.  To do so, please click on the link below within 20 minutes of your request.</p>
          <p>Your username is:<br>${username}</p>
          <p style="margin: 30px 0"><strong><big><a href="${resetUrl}" style="text-decoration: underline">Reset my password</a></big></strong></p>
          <p>E.A.S.E. Employment Services</p>
          <div style="margin: 40px 0 20px 0">
            <small><small style="color: #ccc">
              <hr size="1" color="#ccc" />
              Message ID: ${messageID.toUpperCase()}
            </small></small>
          </div>
        `;
        utils
          .sendEmail(recipientEmail, emailSenderText, subject, body)
          .then((result) => {
            return res.status(200).send({
              msg: "password reset e-mail sent",
              msgType: "success",
            });
          })
          .catch((error) => {
            console.log(error);
            return res.status(500).send({
              msg: "password reset e-mail could not be sent",
              msgType: "error",
              error: error,
            });
          });
      }
    );
  });
};
