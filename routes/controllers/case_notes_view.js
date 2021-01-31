const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["sysadmin", "director", "user"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid}) is not authorized.`);
    return res.status(401).send({
      msg: "user is not authorized for this action",
      msgType: "error",
    });
  }

  const participantid = parseInt(Math.abs(req.body.participantid)) || "";
  const timeZone = req.body.timeZone || "GMT";
  const timeZoneOffset = moment.tz(timeZone).format("Z:00").slice(0, -3);

  // Validate
  if (typeof participantid !== "number") return res.status(400).send({msg: "invalid participant id", msgType: "error"});

  const sql = `
    SELECT
      firstname, lastname
    FROM
      participants
    WHERE
      participantid = ?
    LIMIT
      1
    ;
  `;
  db.query(sql, [participantid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ msg: "unable to query for participant", msgType: "error" });
    }

    if (!result.length) return res.status(404).send({ msg: "participant not found", msgType: "error" });

    const participantName = `${result[0].firstname} ${result[0].lastname}`;

    const sql = `
      SELECT
        employeeid
      FROM
        employees__participants
      WHERE
        employeeid = ?
      AND
        participantid = ?
      LIMIT
        1
      ;
    `;
    db.query(sql, [req.user.employeeid, participantid], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: "unable to verify if employee has viewing permissions", msgType: "error" });
      }

      if (!result.length && req.user.type === "regular") return res.status(404).send({ msg: "participant not assigned to employee", msgType: "error" });

      const sql = `
        SELECT
          cn.casenoteid,
          date_format(convert_tz(cn.updatedAt, '+00:00', ?), "%Y-%m-%d %k:%i:%s") AS updatedAt
        FROM
          participants__casenotes cn
        INNER JOIN
          employees__participants ep ON ep.participantid = cn.participantid
        WHERE
          cn.participantid = ?
        AND
          ep.employeeid = ?
        ORDER BY
          cn.updatedAt DESC
        ;
      `;

      db.query(sql, [timeZoneOffset, participantid, req.user.employeeid], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send({ msg: "unable to query for case notes", msgType: "error" });
        }

        if (!result.length) return res.status(404).send({ msg: "no case notes found", msgType: "error", participantName: participantName });

        return res.status(200).send({ msg: "case notes retrieved", msgType: "success", participantName: participantName, data: result });
      });
    });
  });
}