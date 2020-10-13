const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const timeZone = req.body.timeZone;
  const timeZoneOffset = moment.tz(timeZone).format("Z:00").slice(0, -3);

  const sql = `
    SELECT
      DATE_FORMAT(CONVERT_TZ(entry, "+00:00", ?), "%h:%i:%s %p") AS entry,
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

  db.query(sql, [timeZoneOffset, employeeid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for time entries for today",
        msgType: "error",
      });
    }

    if (!result.length) {
      return res
        .status(404)
        .send({ msg: "no time entries found for today", msgType: "info" });
    }

    const entries = result.map((item) => {
      const changedItem = {
        type: item.type,
        entry: item.entry,
      };
      return changedItem;
    });

    return res.status(200).send({
      msg: "time entries found for today",
      msgType: "success",
      entries: entries,
    });
  });
};
