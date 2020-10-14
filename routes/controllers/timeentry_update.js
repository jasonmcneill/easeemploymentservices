const db = require("../../database");

exports.POST = (req, res) => {
  const id = req.body.id || "";
  const date = req.body.date || "";
  const time = req.body.time || "";
  const inout = req.body.type || "";

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

  if (!date.length)
    return res.status(400).send({ msg: "missing date", msgType: "error" });

  if (!time.length)
    return res.status(400).send({ msg: "missing time", msgType: "error" });

  if (!["in", "out"].includes(inout))
    return res.status(400).send({ msg: "missing inout" });

  let datetime = "";
  let validDateTime = false;
  try {
    const d = moment(date).format("YYYY-MM-DD");
    const t = moment(time).format("HH:mm:ss");
    datetime = moment(`${d} ${t}`).format("YYYY-MM-DD HH:mm:ss");
    validDateTime = true;
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

    const sql =
      "UPDATE employees__timelogs SET entry = ?, type = ? WHERE timelogid = ?;";
    db.query(sql, [datetime, inout, id], (err, result) => {
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
