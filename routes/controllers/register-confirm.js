exports.POST = (req, res) => {
  const db = require("../../database");
  const token = req.body.token || "";
  const sql = "SELECT employeeid, expiry FROM tokens WHERE token = ? LIMIT 1;";

  db.query(sql, [token], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for registration token",
        msgType: "error",
      });
    }

    if (!result.length)
      return res
        .status(404)
        .send({ msg: "registration token not found", msgType: "error" });

    const employeeid = result[0].employeeid;
    const moment = require("moment");
    const rightNow = moment();
    const expiry = moment(result[0].expiry);
    const isExpired = expiry.isBefore(rightNow) ? true : false;

    if (isExpired) {
      const sql = "DELETE FROM tokens WHERE employeeid = ?";
      db.query(sql, [employeeid], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to remove employee tokens",
            msgType: "error",
          });
        }

        const sql = "DELETE FROM employees WHERE employeeid = ?";
        db.query(sql, [employeeid], (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "unable to remove employee",
              msgType: "error",
            });
          }

          return res
            .status(400)
            .send({ msg: "registration token expired", msgType: "error" });
        });
      });
    } else {
      const sql =
        "UPDATE employees SET status = 'registered' WHERE employeeid = ?;";

      db.query(sql, [employeeid], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to query to set employee status",
            msgType: "error",
          });
        }

        const sql = "UPDATE tokens SET claimed = 1 WHERE token = ?;";

        db.query(sql, [token], (err, result) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .send({
                msg: "unable to designate registration token as claimed",
                msgType: "error",
              });
          }

          return res
            .status(200)
            .send({ msg: "token validated", msgType: "success" });
        });
      });
    }
  });
};
