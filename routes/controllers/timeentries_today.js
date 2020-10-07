const moment = require("moment");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const timeZoneOffset = parseInt(req.body.timeZoneOffset) || 0;

  const todayFrom = moment().format("YYYY-MM-DD 00:00:00");
  const todayFromSql = moment(todayFrom)
    .add(timeZoneOffset, "hours")
    .format("YYYY-MM-DD HH:mm:ss");

  const todayTo = moment().format("YYYY-MM-DD 23:59:59");
  const todayToSql = moment(todayTo)
    .add(timeZoneOffset, "hours")
    .format("YYYY-MM-DD HH:mm:ss");

  const sql = `
    SELECT entry_utc, type
    FROM employees__timelogs
    WHERE entry_utc > ?
    AND entry_utc < ?
    AND employeeid = ?
    ORDER BY
    entry_utc ASC;`;

  console.log(`todayFrom: ${todayFrom}`);
  console.log(`todayTo: ${todayTo}`);
  console.log(`todayFromSql: ${todayFromSql}`);
  console.log(`todayToSql: ${todayToSql}`);

  db.query(sql, [todayFromSql, todayToSql, employeeid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for time entries for today",
        msgType: "error",
      });
    }

    console.log(require("util").inspect(result, true, 7, true));

    if (!result.length) {
      return res
        .status(404)
        .send({ msg: "no time entries found for today", msgType: "info" });
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
      msg: "time entries found for today",
      msgType: "success",
      entries: entries,
    });
  });
};
