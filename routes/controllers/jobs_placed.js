const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const timeZone = req.body.timeZone || "America/Los_Angeles";
  const timeZoneOffset = moment.tz(timeZone).format("Z:00").slice(0, -3);
  const sql = `
    SELECT
      j.jobid,
      j.jobtitle,
      j.city,
      UCASE(j.state) AS state,
      convert_tz(j.createdAt, '+00:00', ?) AS createdAt,
      e.companyname,
      p.firstname AS participantFirstName,
      p.lastname AS participantLastName
    FROM
      jobs j
    INNER JOIN
      employers e
    ON
      j.employerid = e.employerid
    INNER JOIN
      jobplacements pl
    ON
      pl.jobid = j.jobid
    INNER JOIN
      participants p
    ON
      pl.participantid = p.participantid
    WHERE
      j.jobid IN (SELECT jobid FROM jobplacements)
    ORDER BY
      j.createdAt DESC,
      j.employerid,
      j.jobtitle
    ;
  `;
  db.query(sql, [timeZoneOffset], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for jobs", msgType: "error" });
    }

    return res
      .status(200)
      .send({ msg: "jobs retrieved", msgType: "success", data: result });
  });
};
