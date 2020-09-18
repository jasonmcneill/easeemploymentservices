exports.GET = (req, res) => {
  return res.render("forgotPassword", {});
};

exports.POST = (req, res) => {
  const db = require("../../database");
  const email = req.body.email || "";
  const protocol = req.body.protocol;
  const host = req.body.host;
  const validator = require("email-validator");
  const isValidEmail = validator.validate(email);

  if (!isValidEmail)
    return res.status(400).send({
      msg: "invalid e-mail format",
      msgType: "error",
    });

  const sql =
    "SELECT employeeid, firstname, lastname, email, passwordresettoken, passwordresetexpiry FROM employees WHERE email = ? LIMIT 1;";
  db.query(sql, [email], (err, result) => {
    if (err)
      return res
        .status(500)
        .send({ msg: "unable to query for email", msgType: "error" });
    if (!result.length)
      return res.status(404).send({ msg: "user not found", msgType: "error" });
    const moment = require("moment");
    const employeeid = result[0].employeeid;
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
    const expiryInDatabase = result[0].passwordresetexpiry;
    const expiryStillInTheFuture = timeSent.isBefore(expiryInDatabase);
    if (expiryStillInTheFuture && result[0].passwordresettoken.length)
      resetToken = result[0].passwordresettoken;

    const sql =
      "INSERT INTO tokens(token, expiry, purpose, createdAt) VALUES ?, ?, 'reset password', ?;";
    db.query(
      sql,
      [resetToken, passwordResetExpiryMySQL, createdAt],
      (err, result2) => {
        if (err)
          return res.status(500).send({
            msg: "unable to update employee record",
            msgType: "error",
          });
        const uuid = require("uuid");
        const messageID = uuid.v4();
        const utils = require("../utils");
        const resetUrl = `${protocol}//${host}/reset-password#token=${resetToken}`;
        const senderEmail = `E.A.S.E. <no-reply@em6223.easeemploymentservices.com>`;
        const subject = "Reset your password";
        const body = `
          <p>This message is for ${firstname} ${lastname}. We just received your request to reset your password.  To do so, please click on the following link within 20 minutes of your request:</p>
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
          .sendEmail(recipientEmail, senderEmail, subject, body)
          .then((result) => {
            return res.status(result[0].statusCode || 200).send({
              msg: "password reset e-mail sent",
              msgType: "success",
            });
          })
          .catch((error) => {
            console.log(error);
            return res.status(500).send({
              msg: "password reset e-mail could not be sent",
              msgType: "error",
            });
          });
      }
    );
  });
};
