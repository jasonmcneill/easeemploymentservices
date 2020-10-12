const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const timeZone = req.body.timeZone;
  const entry = moment().format("YYYY-MM-DD HH:mm:ss");
  const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");

  const sql = `
    INSERT INTO employees__timelogs (
      employeeid,
      entry,
      type,
      createdAt
    ) VALUES (
      ?,
      ?,
      'out',
      ?
    )
  ;`;

  db.query(sql, [employeeid, entry, createdAt], (err, result1) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to insert time entry", msgType: "error" });
    }

    const timeFrom = moment().format("YYYY-MM-DD 00:00:00");
    const timeTo = moment().format("YYYY-MM-DD 23:59:59");

    const sql =
      "SELECT entry, type FROM employees__timelogs WHERE entry > ? AND entry < ? AND employeeid = ? ORDER BY createdAt ASC;";
    db.query(sql, [timeFrom, timeTo, employeeid], (err, result2) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query for time entries",
          msgType: "error",
        });
      }

      const entries = result2.map((item) => {
        const changedItem = {
          type: item.type,
          entry: moment(item.entry).format("h:mm:ss A"),
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
