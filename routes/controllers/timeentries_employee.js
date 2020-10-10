const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.body.employeeid || "";
  const timeZone = req.body.timeZone;
  const timeZoneOffset = req.body.timeZoneOffset;

  // Set "from" date
  let fromdate;
  if (req.body.fromdate === "") {
    fromdate = moment
      .tz(moment(), timeZone)
      .subtract(7, "days")
      .format("YYYY-MM-DD 00:00:00");
  } else {
    fromdate = moment
      .tz(req.body.fromdate, timeZone)
      .format("YYYY-MM-DD 00:00:00");
  }

  // Set "to" date
  let todate;
  if (req.body.todate === "") {
    todate = moment.tz(moment(), timeZone).format("YYYY-MM-DD 23:59:59");
  } else {
    todate = moment.tz(moment(), timeZone).format("YYYY-MM-DD 23:59:59");
  }

  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["sysadmin", "director"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid} is not authorized.`);
    return res.status(401).send({
      msg: "user is not authorized for this action",
      msgType: "error",
    });
  }

  // Modification:  if "from date" is after "to date", swap them.
  if (moment(fromdate).isAfter(todate)) {
    const oldFromDate = fromdate;
    const oldToDate = todate;
    fromdate = oldToDate;
    todate = oldFromDate;
  }

  // Modification:  set dates to today if they're in the future.
  const now = moment.tz(moment(), timeZone);
  if (moment(fromdate).isAfter(now)) {
    fromdate = moment.tz(moment(), timeZone).format("YYYY-MM-DD 00:00:00");
  }
  if (moment(todate).isAfter(now)) {
    todate = moment.tz(moment(), timeZone).format("YYYY-MM-DD 23:59:59");
  }

  // Validate:  employeeid is required
  if (employeeid === "")
    return res.status(400).send({
      msg: "missing employeeid parameter",
      msgType: "error",
      fromdate: fromdate,
      todate: todate,
    });

  // Query for employee info
  sql =
    "SELECT firstname, lastname, type, status FROM employees WHERE employeeid = ? LIMIT 1;";

  db.query(sql, [employeeid], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for employee", msgType: "error" });
    }

    if (!result.length) {
      return res
        .status(404)
        .send({ msg: "no record of employee", msgType: "error" });
    }

    const firstname = result[0].firstname;
    const lastname = result[0].lastname;
    const type = result[0].type;
    const status = result[0].status;

    const sql = `
      SELECT
        timelogid,
        entry_utc,
        type
      FROM
        employees__timelogs
      WHERE
        employeeid = ?
      AND
        entry_utc BETWEEN ? AND ?
      ORDER BY
        entry_utc
      ;
    `;

    let fromDateSql = moment(fromdate).utc().format("YYYY-MM-DD HH:mm:ss");

    let toDateSql = moment(todate).utc().format("YYYY-MM-DD HH:mm:ss");

    db.query(sql, [employeeid, fromDateSql, toDateSql], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query for time entries",
          msgType: "error",
          firstname: firstname,
          lastname: lastname,
          type: type,
          status: status,
          fromdate: fromdate,
          todate: todate,
        });
      }

      if (!result.length) {
        return res.status(404).send({
          msg: "no time entries found",
          msgType: "error",
          firstname: firstname,
          lastname: lastname,
          type: type,
          status: status,
          fromdate: fromdate,
          todate: todate,
        });
      }

      const entries = result.map((item) => {
        const time = moment
          .utc(item.entry_utc)
          .tz(timeZone)
          .format("h:mm:ss A");
        const date = moment.utc(item.entry_utc).tz(timeZone).format("MMM. D");
        const fulldate = moment
          .utc(item.entry_utc)
          .tz(timeZone)
          .format("YYYY-MM-DD");
        const weekday = moment.utc(item.entry_utc).tz(timeZone).format("ddd");
        const changedItem = {
          id: item.timelogid,
          type: item.type,
          time: time,
          date: date,
          fulldate: fulldate,
          weekday: weekday,
        };
        return changedItem;
      });

      return res.status(200).send({
        msg: "time entries found",
        msgType: "success",
        firstname: firstname,
        lastname: lastname,
        type: type,
        status: status,
        entries: entries,
        fromdate: fromdate,
        todate: todate,
      });
    });
  });
};
