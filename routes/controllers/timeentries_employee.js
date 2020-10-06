const moment = require("moment");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.body.employeeid || "";
  const timeZoneOffset = parseInt(req.body.timeZoneOffset) || 0;

  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["sysadmin", "director"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid} is not authorized.`);
    return res.status(401).send({
      msg: "user is not authorized for this action",
      msgType: "error",
    });
  }

  // Validate:  employeeid is required
  if (employeeid === "")
    return res
      .status(400)
      .send({ msg: "missing employeeid parameter", msgType: "error" });

  // Query for employee info
  sql =
    "SELECT firstname, lastname, type, status FROM employees WHERE employeeid = ? LIMIT 1;";

  db.query(sql, [employeeid], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for employee", msgType: "error" });
    }

    if (!result.length) {
      return res
        .status(404)
        .send({ msg: "no record of employee", msgType: "error" });
    }

    const firstname = result[0].firstname;
    const lastname = result[0].lastname;
    const type = result[0].type;
    const status = result[0].status;

    const sql = `
      SELECT
        entry_utc,
        type
      FROM
        employees__timelogs
      WHERE
        employeeid = ?
      ;
    `;

    db.query(sql, [employeeid], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query for time entries",
          msgType: "error",
          firstname: firstname,
          lastname: lastname,
          type: type,
          status: status,
        });
      }

      if (!result.length)
        return res.status(404).send({
          msg: "no time entries found",
          msgType: "error",
          firstname: firstname,
          lastname: lastname,
          type: type,
          status: status,
        });

      const entries = result.map((item) => {
        const entry = moment(item.entry_utc)
          .subtract(timeZoneOffset, "hours")
          .format("h:mm:ss A");
        const changedItem = {
          type: item.type,
          entry: entry,
        };
        return changedItem;
      });

      return res.status(200).send({
        msg: "time entries found",
        msgType: "success",
        firstname: firstname,
        lastname: lastname,
        type: type,
        status: status,
        entries: entries,
      });
    });
  });
};
