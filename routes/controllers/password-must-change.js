const db = require("../../database");

exports.POST = (req, res) => {
  const password = req.body.newpassword || "";
  const passwordMustChange = req.user.passwordmustchange || false;
  const employeeid = req.user.employeeid;

  if (!passwordMustChange)
    return res
      .status(400)
      .send({ msg: "no need to change password", msgType: "error" });

  if (!password.length)
    return res
      .status(400)
      .send({ msg: "password is missing", msgType: "error" });

  const isValidPassword = require("../utils").validateNewPassword(password);
  if (!isValidPassword)
    return res.status(400).send({
      msg: "password lacks sufficient complexity",
      msgType: "error",
    });

  const bcrypt = require("bcrypt");
  const saltRounds = 10;

  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err)
      return res
        .status(500)
        .send({ msg: "unable to generate password salt", msgType: "error" });
    bcrypt.hash(password, salt, (err, hash) => {
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

        return res
          .status(200)
          .send({ msg: "password updated", msgType: "success" });
      });
    });
  });
};
