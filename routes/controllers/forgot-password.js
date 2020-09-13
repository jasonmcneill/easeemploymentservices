exports.GET = (req, res) => {
  return res.render("forgotPassword", {});
};

exports.POST = (req, res) => {
  const db = require("../../database");
  const email = req.body.email || "";
  const isLocal = req.body.isLocal || false;
  const validator = require("email-validator");
  const isValidEmail = validator.validate(email);

  if (!isValidEmail)
    return res.status(400).send({
      msg: "invalid e-mail format",
      msgType: "error",
    });

  const sql =
    "SELECT employeeid, firstname, lastname, email FROM employees WHERE email = ? LIMIT 1;";
  db.query(sql, [email], (err, result) => {
    if (err)
      return res
        .status(500)
        .send({ msg: "unable to query for email", msgType: "error" });
    if (!result.length)
      return res.status(404).send({ msg: "user not found", msgType: "error" });
    const employeeid = result[0].employeeid;
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    const passwordResetExpiry = new Date();
    passwordResetExpiry.setDate(
      passwordResetExpiry.getDate() + (1 / 24 / 60) * 20
    );
    const sql =
      "UPDATE employees SET passwordresettoken = ?, passwordresetexpiry = ? WHERE employeeid = ?;";
    db.query(
      sql,
      [employeeid, resetToken, passwordResetExpiry],
      (err, result2) => {
        if (err)
          return res.status(500).send({
            msg: "unable to update employee record",
            msgType: "error",
          });
        const utils = require("../utils");
        const resetUrl = isLocal
          ? `http://localhost:3000/password-reset#token=${resetToken}`
          : `https://access.easeemploymentservices.com/password-reset#token=${resetToken}`;
        const recipientEmail = result[0].email;
        const senderEmail = isLocal
          ? "jason.mcneill@grindstonewebdev.com"
          : "no-reply@access.easeemploymentservices.com";
        const subject = "Reset your password";
        const body = `A request was just received to reset your password.  To do so, please click on the following link within 20 minutes of your request: <p><strong><a href="${resetUrl}">Reset my password</a></strong></p>`;
        utils
          .sendEmail(recipientEmail, senderEmail, subject, body)
          .then((sendgridResponse) => {
            return res.status(200).send({
              msg: "password reset e-mail sent",
              msgType: "success",
              response: sendgridResponse,
            });
          })
          .catch((error) => {
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
