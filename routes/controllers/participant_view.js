const moment = require("moment");
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

  const participantid = req.body.participantid || "";

  // Validate

  if (participantid === "")
    return res
      .status(400)
      .send({ msg: "participant id is required", msgType: "error" });

  if (typeof participantid !== "number")
    return res
      .status(400)
      .send({ msg: "participant id must be numeric", msgType: "error" });

  // Query

  const sql = `
    SELECT
      p.participantid,
      p.employeeid,
      p.firstname,
      p.lastname,
      p.phone,
      p.phonecountry,
      p.address,
      p.city,
      UCASE(p.state) AS state,
      p.zip,
      p.authorizationdate,
      p.seekshousing,
      p.seeksemployment,
      e.employeeid,
      e.firstname AS employeeFirstName,
      e.lastname AS employeeLastName
    FROM
      participants p
    LEFT OUTER JOIN employees e ON p.employeeid = e.employeeid
    WHERE
      p.participantid = ?
    LIMIT 1
    ;
  `;
  db.query(sql, [participantid], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for participant", msgType: "error" });
    }

    if (!result.length) {
      return res
        .status(404)
        .send({ msg: "no record of participant", msgType: "error" });
    }

    return res.status(200).send({
      msg: "participant retrieved",
      msgType: "success",
      data: result[0],
    });
  });
};
