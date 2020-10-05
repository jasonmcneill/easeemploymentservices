const db = require("../../database");
const moment = require("moment");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const entry_utc = moment.utc().format("YYYY-MM-DD HH:mm:ss");
  const createdAt = moment().format("YYYY-MM-DD");
  const sql = `
    INSERT INTO employees__timelogs (
      employeeid,
      entry_utc,
      type,
      createdAt
    ) VALUES (
      ?,
      ?,
      'in',
      ?
    )
  ;`;

  db.query(sql, [employeeid, entry_utc, createdAt], (err) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to insert time entry", msgType: "error" });
    }

    const sql =
      "SELECT entry_utc, type FROM employees__timelogs WHERE createdAt = ? AND employeeid = ? ORDER BY createdAt ASC;";
    db.query(sql, [createdAt, employeeid], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query for time entries",
          msgType: "error",
        });
      }

      return res.status(200).send({
        msg: "clock-in succeeded",
        msgType: "success",
        entries: result,
      });
    });
  });
};
