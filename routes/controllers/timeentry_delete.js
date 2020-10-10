const db = require("../../database");

exports.POST = (req, res) => {
  const id = req.body.id || "";

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

  if (!id.length) return res.status(404).send({msg: "missing time entry id", msgType: "error"});

  const sql = "DELETE FROM employees__timelogs WHERE timelogid = ?;";
  db.query(sql, [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send({msg: "unable to query for time log", msgType: "error"});
    }

    return res.status(200).send({msg: "time entry deleted", msgType: "success"});
  });
}