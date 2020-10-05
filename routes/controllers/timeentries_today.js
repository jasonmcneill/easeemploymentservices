const moment = require("moment");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const timeZoneOffset = parseInt(req.body.timeZoneOffset) || 0;
  const todayStart = moment.utc().format("YYYY-MM-DD 00:00:00");
  const todayEnd = moment.utc().format("YYYY-MM-DD 23:59:00");
  const sql =
    "SELECT entry_utc, type FROM employees__timelogs WHERE entry_utc BETWEEN ? AND ? AND employeeid = ? ORDER BY createdAt ASC;";

  db.query(sql, [todayStart, todayEnd, employeeid], (err, result) => {
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
