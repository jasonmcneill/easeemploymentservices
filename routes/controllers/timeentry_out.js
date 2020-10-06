const moment = require("moment");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const timeZoneOffset = parseInt(req.body.timeZoneOffset) || 0;
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
      'out',
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
        msg: "clock-out succeeded",
        msgType: "success",
        entries: entries,
      });
    });
  });
};
