exports.GET = (req, res) => {
  return res.render("login", {});
};

exports.POST = (req, res) => {
  const bcrypt = require("bcrypt");
  const db = require("../../database");
  const saltRounds = 10;
  const username = req.username;
  const password = req.password;
  const sql = "SELECT id, password FROM employees WHERE username = ? LIMIT 1;";
  db.query(sql, [username], (err, result) => {
    if (err)
      return res.status(500).send({
        msg: "unable to query for user",
        msgType: "error",
      });

    if (result.length === 0)
      return res.status(404).send({
        msg: "invalid login",
        msgType: "error",
      });

    bcrypt.compare(password, result.password, (err, result) => {
      if (err)
        return res.status(500).send({
          msg: "unable to verify password",
          msgType: "error",
        });

      if (result === false)
        return res.status(400).send({
          msg: "invalid login",
          msgType: "error",
        });

      return res.status(200).send({
        msg: "user authenticated",
        msgType: "success",
      });
    });
  });
  res.status(404).send({
    msg: "authentication failed",
    msgType: "error",
    refreshToken: "",
    accessToken: "",
  });
};
