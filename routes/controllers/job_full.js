const db = require("../../database");

exports.GET = (req, res) => {
  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["director", "sysadmin"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid}) is not authorized.`);
    return res.status(401).send({
      msg: "user is not authorized for this action",
      msgType: "error",
    });
  }

  const sql = `
    SELECT
      j.*,
      e.companyname,
      pl.participantid
    FROM
      jobs j
    LEFT OUTER JOIN
      jobplacements pl
    ON
      pl.jobid = j.jobid
    INNER JOIN
      employers e
    ON
      j.employerid = e.employerid
    WHERE
      j.jobid = ?
    ORDER BY
      createdAt DESC
    ;
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for job", msgType: "error" });
    }

    return res
      .status(200)
      .send({ msg: "job retrieved", msgType: "success", data: result[0] });
  });
};
