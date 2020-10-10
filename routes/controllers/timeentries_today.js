const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const timeZone = req.body.timeZone;
  const timeZoneOffset = req.body.timeZoneOffset;

  let todayFrom = moment.tz(moment(), timeZone).format("YYYY-MM-DD 00:00:00");
  let todayFromSql = moment(todayFrom).utc().format("YYYY-MM-DD HH:mm:ss");

  let todayTo = moment.tz(moment(), timeZone).format("YYYY-MM-DD 23:59:59");
  let todayToSql = moment(todayTo).utc().format("YYYY-MM-DD HH:mm:ss");

  const sql = `
    SELECT entry_utc, type
    FROM employees__timelogs
    WHERE entry_utc > ?
    AND entry_utc < ?
    AND employeeid = ?
    ORDER BY
    entry_utc ASC;`;

  db.query(sql, [todayFromSql, todayToSql, employeeid], (err, result) => {
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
      const entry = moment.utc().tz(timeZone).format("h:mm:ss A");
      const changedItem = {
        type: item.type,
        entry: entry,
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
