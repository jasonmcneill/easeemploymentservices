const db = require("../../database");

exports.POST = (req, res) => {
  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["director", "sysadmin"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid} is not authorized.`);
    return res.status(401).send({
      msg: "user is not authorized for this action",
      msgType: "error",
    });
  }

  function deleteJob(id) {
    const sql = "DELETE FROM jobs WHERE jobid = ?;";
    db.query(sql, [jobid], (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .send({ msg: "unable to delete job", msgType: "error" });
      }

      return res.status(200).send({ msg: "job deleted", msgType: "error" });
    });
  }

  const jobid = parseInt(req.body.id) || "";

  if (typeof jobid !== "number" || jobid <= 0) {
    return res.status(400).send({ msg: "invalid job id", msgType: "error" });
  }

  // Get placements for this job
  const sql = "SELECT placementid FROM placements WHERE jobid = ?;";
  db.query(sql, [jobid], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for job placements", msgType: "error" });
    }

    if (!result.length) return deleteJob(jobid);

    // Delete placement notes
    const placements = result.map((item) => item);
    const sql = "DELETE FROM placements__notes WHERE placementid IN ?;";
    db.query(sql, [placements], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to delete from placement notes",
          msgType: "error",
        });
      }

      // Delete placements
      const sql = "DELETE FROM placements WHERE jobid = ?;";
      db.query(sql, [jobid], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to delete from placements",
            msgType: "error",
          });
        }

        // Delete job
        return deleteJob(jobid);
      });
    });
  });
};
