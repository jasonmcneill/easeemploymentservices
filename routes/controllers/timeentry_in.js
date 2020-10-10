const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const timeZone = req.body.timeZone;
  const timeZoneOffset = req.body.timeZoneOffset;
  const entry_utc = moment
    .tz(moment(), timeZone)
    .utc()
    .format("YYYY-MM-DD HH:mm:ss");
  const createdAt = moment.tz(moment(), timeZone).format("YYYY-MM-DD HH:mm:ss");

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

  db.query(sql, [employeeid, entry_utc, createdAt], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to insert time entry", msgType: "error" });
    }

    const timeFrom = moment
      .tz(moment(), timeZone)
      .format("YYYY-MM-DD 00:00:00");
    const timeTo = moment.tz(moment(), timeZone).format("YYYY-MM-DD 23:59:59");
    const timeFromSql = moment(timeFrom).utc().format("YYYY-MM-DD HH:mm:ss");
    const timeToSql = moment(timeTo).utc().format("YYYY-MM-DD HH:mm:ss");

    const sql =
      "SELECT entry_utc, type FROM employees__timelogs WHERE entry_utc > ? AND entry_utc < ? AND employeeid = ? ORDER BY createdAt ASC;";
    db.query(sql, [timeFromSql, timeToSql, employeeid], (err, result) => {
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
        msg: "clock-in succeeded",
        msgType: "success",
        entries: entries,
      });
    });
  });
};
