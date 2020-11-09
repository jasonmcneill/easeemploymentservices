const db = require("../../database");
const moment = require("moment");

exports.POST = (req, res) => {
  const id = req.body.id || "";
  const datetime = req.body.datetime || "";
  const inout = req.body.inout || "";
  const timeZone = req.body.timeZone || "";
  const timeZoneOffset = moment.tz(timeZone).format("Z:00").slice(0, -3);

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

  //  Validation

  if (!id.length)
    return res
      .status(400)
      .send({ msg: "missing time entry id", msgType: "error" });

  if (!["in", "out"].includes(inout))
    return res.status(400).send({ msg: "missing inout" });

  let validDateTime = false;
  try {
    const dt = moment(datetime).format("YYYY-MM-DD HH:mm:ss");
    validDateTime = dt === "Invalid date" ? false : true;
  } catch (err) {
    console.log(err);
  }

  if (!validDateTime) {
    return res.status(400).send({ msg: "invalid date/time", msgType: "error" });
  }

  const sql = "SELECT timelogid FROM employees__timelogs WHERE timelogid = ?;";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for time log id", msgType: "error" });
    }

    if (!result.length) {
      return res.status(404).send({ msg: "no record of id", msgType: "error" });
    }

    const sql = `
      UPDATE
        employees__timelogs
      SET
        entry = convert_tz(?, ?, '+00:00'),
        type = ?
      WHERE
        timelogid = ?
      ;`;
    db.query(sql, [datetime, timeZoneOffset, inout, id], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "unable to query for updating" });
      }

      return res
        .status(200)
        .send({ msg: "time entry updated", msgType: "success" });
    });
  });
};
