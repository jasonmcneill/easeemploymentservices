const db = require("../../database");

exports.POST = (req, res) => {
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

  const employeeid = parseInt(req.body.employeeid) || "";

  // Validate
  if (typeof employeeid !== "number")
    return res
      .status(400)
      .send({ msg: "invalid employee id", msgType: "error" });

  // Query
  const sql = `
    SELECT
      participantid,
      firstname,
      lastname,
      seekshousing,
      seeksemployment
    FROM
      participants
    WHERE
      employeeid = ?
    ORDER BY
      lastname,
      firstname
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
