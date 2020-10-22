const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const participantid = req.body.participantid;
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
        convert_tz(t.entry, '+00:00', ?) AS entry,
        t.type,
        t.participantid,
        p.firstname,
        p.lastname
      FROM
        employees__timelogs t
      LEFT OUTER JOIN participants p ON t.participantid = p.participantid
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
          const { type, entry, participantid, firstname, lastname } = item;
          const changedItem = {
            type: type,
            entry: moment(entry).format("h:mm:ss A"),
            participant: {
              id: participantid,
              name: participantid === 0 ? "EASE" : `${firstname} ${lastname}`,
            },
          };
          return changedItem;
        });

        return res.status(200).send({
          msg: "clock-out succeeded",
          msgType: "success",
          entries: entries,
        });
      }
    );
  });
};
