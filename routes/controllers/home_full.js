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
      h.*,
      p.companyname,
      hpl.participantid
    FROM
      homes h
    LEFT OUTER JOIN
      housingplacements hpl
    ON
      hpl.homeid = h.homeid
    INNER JOIN
      providers p
    ON
      h.providerid = p.providerid
    WHERE
      h.homeid = ?
    ORDER BY
      createdAt DESC
    ;
  `;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for home", msgType: "error" });
    }

    return res
      .status(200)
      .send({ msg: "home retrieved", msgType: "success", data: result[0] });
  });
};
