const db = require("../../database");

exports.GET = (req, res) => {
  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["reguar", "director", "sysadmin"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid} is not authorized.`);
    return res.status(401).send({
      msg: "user is not authorized for this action",
      msgType: "error",
    });
  }

  const employeeid = req.user.employeeid;

  // Query
  const sql = `
    SELECT
      p.participantid,
      p.employeeid,
      p.firstname,
      p.lastname,
      e.firstname AS employeeFirstName,
      e.lastname AS employeeLastName
    FROM
      participants p
    LEFT OUTER JOIN
      employees e
    ON
      p.employeeid = e.employeeid
    WHERE
      p.employeeid = ?
    ORDER BY
      p.lastname,
      p.firstname
    ;
  `;

  db.query(sql, [employeeid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for participants of employee",
        msgType: "error",
      });
    }

    return res.status(200).send({
      msg: "participants of employee retrieved",
      msgType: "success",
      participants: result,
    });
  });
};
