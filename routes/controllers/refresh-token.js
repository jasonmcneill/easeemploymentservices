const db = require("../../database");

exports.POST = (req, res) => {
  const refreshToken = req.body.refreshToken || "";
  const jsonwebtoken = require("jsonwebtoken");

  if (!refreshToken.length)
    return res
      .status(400)
      .send({ msg: "refresh token missing", msgType: "error" });

  jsonwebtoken.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, userdata) => {
      if (err) {
        console.log(err);
        return res
          .status(403)
          .send({ msg: "invalid refresh token", msgType: "error" });
      }

      const now = Date.now().valueOf() / 1000;
      if (now > userdata.exp)
        return res
          .status(400)
          .send({ msg: "refresh token expired", msgType: "error" });

      const employeeid = userdata.employeeid;
      const sql =
        "SELECT employeeid, type FROM employees WHERE employeeid = ?;";
      db.query(sql, [employeeid], (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .send({ msg: "unable to query for employeeid", msgType: "error" });
        }

        if (!result.length)
          return res
            .status(404)
            .send({ msg: "employee not found", msgType: "error" });

        const refreshToken = jsonwebtoken.sign(
          {
            employeeid: employeeid,
          },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "30d" }
        );

        const accessToken = jsonwebtoken.sign(
          {
            employeeid: employeeid,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "10m" }
        );

        return res.status(200).send({
          msg: "tokens renewed",
          msgType: "success",
          refreshToken: refreshToken,
          accessToken: accessToken,
        });
      });
    }
  );
};
