const db = require("../../database");

exports.POST = (req, res) => {
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

  const employerid = parseInt(req.body.employerid) || "";

  if (typeof employerid !== "number")
    return res
      .status(400)
      .send({ msg: "invalid employer id", msgType: "error" });

  // DELETE EMPLOYER
  const sql = "DELETE FROM employers WHERE employerid = ?;";
  db.query(sql, [employerid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to delete employer",
        msgType: "error",
        error: err,
      });
    }

    // GET JOBS BY EMPLOYER
    const sql = "SELECT jobid FROM jobs WHERE employerid = ?;";
    db.query(sql, [employerid], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query for jobs by employer",
          msgType: "error",
          error: err,
        });
      }

      if (!result.length)
        return res
          .status(200)
          .send({ msg: "employer deleted", msgType: "success" });

      const jobs = result;

      // DELETE JOBS BY EMPLOYER
      const sql = "DELETE FROM jobs WHERE employerid = ?;";
      db.query(sql, [employerid], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to delete jobs by employer",
            msgType: "error",
            error: err,
          });
        }

        // GET PLACEMENTS PER JOB
        const sql = "SELECT placementid FROM jobplacements WHERE jobid IN (?);";
        const jobsSql = jobs.forEach((item, index) => {
          let response = "";
          if (index !== 0) response += ",";
          response += item;
        });

        db.query(sql, [jobsSql], (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "unable to query for job placements",
              msgType: "error",
              error: err,
            });
          }

          if (!result.length)
            return res
              .status(200)
              .send({ msg: "employer deleted", msgType: "success" });

          const placements = result;

          // DELETE PLACEMENTS PER JOB
          const sql = "DELETE FROM jobplacements WHERE jobid IN ?;";
          const placementsSql = placements.forEach((item, index) => {
            let response = "";
            if (index !== 0) response += ",";
            response += item;
          });
          db.query(sql, [placementsSql], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).send({
                msg: "unable to delete job placements",
                msgType: "error",
                error: err,
              });
            }

            // GET PLACEMENT NOTES PER PLACEMENT
            const sql =
              "SELECT nodeid FROM jobplacements WHERE placementid IN ?;";
            db.query(sql, [placementsSql], (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).send({
                  msg: "unable to query for placement notes",
                  msgType: "error",
                  error: err,
                });
              }

              if (!result.length)
                return res
                  .status(200)
                  .send({ msg: "employer deleted", msgType: "success" });

              const notes = result;

              // DELETE PLACEMENT NOTES PER PLACEMENT
              const sql =
                "DELETE FROM jobplacements__notes WHERE placementid IN ?;";
              const notesSql = notes.forEach((item, index) => {
                let response = "";
                if (index !== 0) response += ",";
                response += item;
              });
              db.query(sql, [notesSql], (err, result) => {
                if (err) {
                  console.log(err);
                  return res.status(500).send({
                    msg: "unable to delete placement notes",
                    msgType: "error",
                    error: err,
                  });
                }

                // ALL DONE
                return res
                  .status(200)
                  .send({ msg: "employer deleted", msgType: "success" });
              });
            });
          });
        });
      });
    });
  });
};
