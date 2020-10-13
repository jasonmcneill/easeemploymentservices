const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const timeZone = req.body.timeZone;
  const timeZoneOffset = moment.tz(timeZone).format("Z:00").slice(0, -3);

  const sql = `
    INSERT INTO employees__timelogs (
      employeeid,
      entry,
      type,
      createdAt
    ) VALUES (
      ?,
      UTC_TIMESTAMP(),
      'out',
      UTC_TIMESTAMP()
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
        CONVERT_TZ(entry, "+00:00", ?) AS entry,
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

    db.query(sql, [timeZoneOffset, employeeid], (err, result2) => {
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
