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
      pl.homeid,
      h.hometitle,
      h.city,
      h.state,
      prov.employerid,
      prov.companyname
    FROM
      housingplacements hpl
    INNER JOIN
      homes h
    ON
      hpl.homeid = h.homeid
    INNER JOIN
      providers prov
    ON
      h.providerid = prov.providerid
    WHERE
      hpl.participantid = ?
    AND
      hpl.enddate IS NULL
    ORDER BY
      hpl.createdAt DESC
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
      msg: "housing placements retrieved",
      msgType: "success",
      data: response,
    });
  });
};
