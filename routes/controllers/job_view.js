const moment = require("moment-timezone");
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

  const timeZone = req.body.timeZone || "America/Los_Angeles";
  const timeZoneOffset = moment.tz(timeZone).format("Z:00").slice(0, -3);

  const jobid = parseInt(req.params.id) || "";
  if (typeof jobid !== "number" || jobid <= 0) {
    return res.status(400).send({ msg: "invalid job id", msgType: "error" });
  }

  const sql = `
    SELECT
      j.*,
      e.companyname,
      p.participantid,
      p.firstname AS participantFirstName,
      p.lastname AS participantLastName,
      date_format(convert_tz(pl.createdAt, '+00:00', ?), "%Y-%m-%d") AS createdAt,
      date_format(convert_tz(pl.begindate, '+00:00', ?), "%Y-%m-%d") AS placementBeginDate
    FROM
      jobs j
    INNER JOIN employers e ON j.employerid = e.employerid
    LEFT OUTER JOIN placements pl ON pl.jobid = j.jobid
    LEFT OUTER JOIN participants p ON p.participantid = pl.participantid
    WHERE
      j.jobid = ?
    ORDER BY
      createdAt DESC
    ;
  `;
  db.query(sql, [timeZoneOffset, timeZoneOffset, jobid], (err, result) => {
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
