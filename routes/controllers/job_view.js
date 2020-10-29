const db = require("../../database");

exports.GET = (req, res) => {
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

  const jobid = parseInt(req.params.id) || "";
  if (typeof jobid !== "number" || jobid <= 0) {
    return res.status(400).send({ msg: "invalid job id", msgType: "error" });
  }

  const sql =
    "SELECT j.*, e.companyname FROM jobs j INNER JOIN employers e ON j.employerid = e.employerid WHERE j.jobid = ? ORDER BY createdAt DESC;";
  db.query(sql, [jobid], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for job", msgType: "error", error: err });
    }

    return res
      .status(200)
      .send({ msg: "retrieved job", msgType: "success", data: result[0] });
  });
};
