exports.GET = (req, res) => {
  return res.render("resetPassword", {});
};

exports.POST = (req, res) => {
  const db = require("../../database");
  const token = req.body.token || "";
  const newPassword = req.body.newPassword || "";
  const sql = `SELECT e.employeeid, t.token, t.expiry
    FROM employees e
    INNER JOIN tokens t ON t.employeeid = e.employeeid
    WHERE t.token = ?
    AND t.purpose = 'password reset'
    LIMIT 1;`;

  db.query(sql, [token], (error, result) => {
    if (error)
      return res
        .status(500)
        .send({ msg: "unable to query for token", msgType: "error" });
    if (!result.length)
      return res.status(404).send({ msg: "token not found", msgType: "error" });

    const employeeid = result[0].employeeid;
    const moment = require("moment");
    const dateExpiry = moment(result[0].expiry);
    const dateNow = moment();
    const isExpired = dateExpiry.isBefore(dateNow);

    if (isExpired)
      return res
        .status(400)
        .send({ msg: "token is expired", msgType: "error" });

    const utils = require("../utils");
    const isValidPassword = utils.validateNewPassword(newPassword);
    if (!isValidPassword)
      return res.status(400).send({
        msg: "new password lacks sufficient complexity",
        msgType: "error",
      });

    const bcrypt = require("bcrypt");
    const saltRounds = 10;

    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err)
        return res
          .status(500)
          .send({ msg: "unable to generate password salt", msgType: "error" });
      bcrypt.hash(newPassword, salt, (err, hash) => {
        if (err)
          return res.status(500).send({
            msg: "unable to generate password hash",
            msgType: "error",
          });
        const sql =
          "UPDATE employees SET password = ?, passwordmustchange = 0 WHERE employeeid = ?;";
        db.query(sql, [hash, employeeid], (err, result) => {
          if (err) {
            console.log(err);

            return res.status(500).send({
              msg: "unable to store hashed password",
              msgType: "error",
            });
          }

          const sql = `UPDATE tokens SET claimed = 1 WHERE token = ?`;
          db.query(sql, [token], (err, result) => {
            if (err) {
              console.log(err);

              return res.status(500).send({
                msg: "unable to designate token as claimed",
                msgType: "error",
              });
            }

            return res
              .status(200)
              .send({ msg: "password updated", msgType: "success" });
          });
        });
      });
    });
  });
};
