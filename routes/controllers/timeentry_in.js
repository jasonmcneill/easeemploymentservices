const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const timeZone = req.body.timeZone;

  const sql = `
    INSERT INTO employees__timelogs (
      employeeid,
      entry,
      type,
      createdAt
    ) VALUES (
      ?,
      now(),
      'in',
      now()
    )
  ;`;

  db.query(sql, [employeeid], (err, result1) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to insert time entry", msgType: "error" });
    }

    const sql = `
      SELECT
        DATE_FORMAT(entry, "%Y-%m-%d %H:%i:%s") AS entry,
        type
      FROM
        employees__timelogs
      WHERE
        entry >= CURDATE()
      AND
        entry < CURRENT_DATE() + INTERVAL 1 DAY
      AND
        employeeid = ?
      ORDER BY
        entry ASC;`;

    db.query(sql, [employeeid], (err, result2) => {
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
          entry: item.entry,
          fulldate: item.fulldate,
        };
        return changedItem;
      });

      return res.status(200).send({
        msg: "clock-in succeeded",
        msgType: "success",
        entries: entries,
      });
    });
  });
};
