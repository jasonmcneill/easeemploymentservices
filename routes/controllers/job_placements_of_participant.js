const db = require("../../database");

exports.POST = (req, res) => {
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

  const participantid = parseInt(req.body.participantid) || "";
  if (typeof participantid !== "number")
    return res
      .status(400)
      .send({ msg: "invalid participant id", msgType: "error" });

  const sql = `
    SELECT
      pl.jobid,
      j.jobtitle,
      j.city,
      j.state,
      e.employerid,
      e.companyname
    FROM
      placements pl
    INNER JOIN
      jobs j
    ON
      pl.jobid = j.jobid
    INNER JOIN
      employers e
    ON
      j.employerid = e.employerid
    WHERE
      pl.participantid = ?
    AND
      pl.enddate IS NULL
    ORDER BY
      pl.createdAt DESC
    ;
  `;

  db.query(sql, [participantid], (err, response) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for participant id",
        msgType: "error",
        error: err,
      });
    }

    return res.status(200).send({
      msg: "placements retrieved",
      msgType: "success",
      data: response,
    });
  });
};
