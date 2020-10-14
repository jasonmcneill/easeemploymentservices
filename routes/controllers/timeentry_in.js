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
      'in',
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
	      convert_tz(entry, '+00:00', ?) AS entry,
        type
      FROM
	      employees__timelogs
      WHERE
	      entry >= convert_tz(date_format(convert_tz(utc_timestamp(), '+00:00', ?), "%Y-%m-%d 00:00:00"), ?, '+00:00')
      AND
        entry <= convert_tz(date_format(convert_tz(utc_timestamp(), '+00:00', ?), '%Y-%m-%d 23:59:59'), ?, '+00:00')
      AND
        employeeid = ?
      ;
    `;

    db.query(
      sql,
      [
        timeZoneOffset,
        timeZoneOffset,
        timeZoneOffset,
        timeZoneOffset,
        timeZoneOffset,
        employeeid,
      ],
      (err, result2) => {
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
          msg: "clock-in succeeded",
          msgType: "success",
          entries: entries,
        });
      }
    );
  });
};
