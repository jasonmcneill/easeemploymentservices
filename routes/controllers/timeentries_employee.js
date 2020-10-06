const moment = require("moment");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.body.employeeid || "";
  const timeZoneOffset = parseInt(req.body.timeZoneOffset) || 0;
  const now = moment();

  const defaultFromDate = moment()
    .subtract(7, "days")
    .utc()
    .format("YYYY-MM-DD 00:00:00");
  const defaultToDate = moment().utc().format("YYYY-MM-DD HH:mm:ss");

  let fromdate = req.body.fromdate
    ? moment(req.body.fromdate).format("YYYY-MM-DD 00:00:00")
    : defaultFromDate;
  let todate = req.body.todate
    ? moment(req.body.todate).format("YYYY-MM-DD HH:mm:ss")
    : defaultToDate;

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

  // Validate:  "from date" must be before "to date"
  if (moment(fromdate).isAfter(todate)) {
    const oldFromDate = fromdate;
    const oldToDate = todate;
    fromdate = oldToDate;
    todate = oldFromDate;
  }

  // Validate:  dates must not be in the future
  if (moment(fromdate).isAfter(now)) {
    fromdate = defaultFromDate;
  }
  if (moment(todate).isAfter(now)) {
    todate = defaultToDate;
  }

  // Validate:  employeeid is required
  if (employeeid === "")
    return res
      .status(400)
      .send({ msg: "missing employeeid parameter", msgType: "error" });

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

    db.query(sql, [employeeid, fromdate, todate], (err, result) => {
      fromdate = moment(fromdate)
        .subtract(timeZoneOffset, "hours")
        .format("YYYY-MM-DD");
      todate = moment(todate)
        .subtract(timeZoneOffset, "hours")
        .format("YYYY-MM-DD");

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
        const time = moment(item.entry_utc)
          .subtract(timeZoneOffset, "hours")
          .format("h:mm:ss A");
        const date = moment(item.entry_utc)
          .subtract(timeZoneOffset, "hours")
          .format("MMM. D");
        const weekday = moment(item.entry_utc)
          .subtract(timeZoneOffset, "hours")
          .format("ddd");
        const changedItem = {
          type: item.type,
          time: time,
          date: date,
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
