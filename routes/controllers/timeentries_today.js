const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.user.employeeid;
  const timeZone = req.body.timeZone;

  let todayFrom = moment().format("YYYY-MM-DD 00:00:00");

  let todayTo = moment().format("YYYY-MM-DD 23:59:59");

  const sql = `
    SELECT entry, type
    FROM employees__timelogs
    WHERE entry > ?
    AND entry < ?
    AND employeeid = ?
    ORDER BY
    entry ASC;`;

  db.query(sql, [todayFrom, todayTo, employeeid], (err, result) => {
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
      const entry = new String(item.entry).toString();
      const changedItem = {
        type: item.type,
        entry: moment(entry).format("h:mm:ss A"),
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
