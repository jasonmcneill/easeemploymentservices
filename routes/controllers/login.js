exports.POST = (req, res) => {
  const bcrypt = require("bcrypt");
  const db = require("../../database");
  const username = req.body.username;
  const password = req.body.password;
  const sql =
    "SELECT employeeid, password, status FROM employees WHERE username = ? LIMIT 1;";
  db.query(sql, [username], (err, result) => {
    if (err) {
      return res.status(500).send({
        msg: "unable to query for user",
        msgType: "error",
      });
    }

    if (!result.length)
      return res.status(404).send({
        msg: "invalid login",
        msgType: "error",
      });

    const employeeid = result[0].employeeid;
    const passwordFromDB = result[0].password;
    const status = result[0].status;

    if (status !== "registered") {
      return res
        .status(400)
        .send({ msg: "employee status is not registered", msgType: "error" });
    }

    bcrypt.compare(password, passwordFromDB, (err, result) => {
      const jsonwebtoken = require("jsonwebtoken");

      if (err)
        return res.status(500).send({
          msg: "unable to verify login",
          msgType: "error",
        });

      if (!result)
        return res.status(404).send({
          msg: "invalid login",
          msgType: "error",
        });

      const refreshToken = jsonwebtoken.sign(
        {
          employeeid: employeeid,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "180d" }
      );

      const accessToken = jsonwebtoken.sign(
        {
          employeeid: employeeid,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10m" }
      );

      return res.status(200).send({
        msg: "user authenticated",
        msgType: "success",
        refreshToken: refreshToken,
        accessToken: accessToken,
      });
    });
  });
};
