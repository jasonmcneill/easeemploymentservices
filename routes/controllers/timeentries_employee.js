const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = req.body.employeeid || "";
  const timeZone = req.body.timeZone;
  const timeZoneOffset = moment.tz(timeZone).format("Z:00").slice(0, -3);

  // Set "from" date
  let fromdate;
  if (req.body.fromdate === "") {
    fromdate = moment().subtract(7, "days").format("YYYY-MM-DD 00:00:00");
  } else {
    fromdate = moment(req.body.fromdate).format("YYYY-MM-DD 00:00:00");
  }

  // Set "to" date
  let todate;
  if (req.body.todate === "") {
    todate = moment().format("YYYY-MM-DD 23:59:59");
  } else {
    todate = moment(req.body.todate).format("YYYY-MM-DD 23:59:59");
  }

  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["sysadmin", "director"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid}) is not authorized.`);
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
  const now = moment();
  if (moment(fromdate).isAfter(now)) {
    fromdate = moment().format("YYYY-MM-DD 00:00:00");
  }
  if (moment(todate).isAfter(now)) {
    todate = moment().format("YYYY-MM-DD 23:59:59");
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

    const utcFromDate = moment(fromdate)
      .tz("UTC")
      .format("YYYY-MM-DD HH:mm:ss");
    const utcToDate = moment(todate).tz("UTC").format("YYYY-MM-DD HH:mm:ss");

    const sql = `
      SELECT
        t.timelogid,
        convert_tz(t.entry, '+00:00', ?) AS entry,
        t.type,
        t.participantid,
        p.firstname,
        p.lastname
      FROM
        employees__timelogs t
      LEFT OUTER JOIN participants p ON t.participantid = p.participantid
      WHERE
        entry >= convert_tz(date_format(convert_tz(?, '+00:00', ?), "%Y-%m-%d 00:00:00"), ?, '+00:00')
      AND
        entry <= convert_tz(date_format(convert_tz(utc_timestamp(), '+00:00', ?), '%Y-%m-%d 23:59:59'), ?, '+00:00')
      AND
        t.employeeid = ?
      ;
    `;

    db.query(
      sql,
      [
        timeZoneOffset,
        fromdate,
        timeZoneOffset,
        timeZoneOffset,
        timeZoneOffset,
        timeZoneOffset,
        employeeid,
      ],
      (err, result) => {
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
          const { timelogid, entry, type, participantid, firstname, lastname } =
            item;
          const time = moment(entry).format("h:mm:ss A");
          const date = moment(entry).format("MMM. D");
          const fulldate = moment(entry).format("YYYY-MM-DD");
          const weekday = moment(entry).format("ddd");
          const changedItem = {
            id: timelogid,
            type: type,
            time: time,
            date: date,
            fulldate: fulldate,
            weekday: weekday,
            participant: {
              id: participantid,
              name: participantid === 0 ? "EASE" : `${firstname} ${lastname}`,
            },
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
      }
    );
  });
};
