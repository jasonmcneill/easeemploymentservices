const db = require("../../database");

exports.GET = (req, res) => {
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

  const sql = `
    SELECT
      (SELECT COUNT(participantid) FROM participants) AS numParticipants
    ;
  `;
  db.query(sql, [], (err, result1) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for summary", msgType: "error" });
    }

    const sql = `
      SELECT
        participantid,
        firstname,
        lastname
      FROM
        participants
      WHERE
        employeeid IS NULL
      ORDER BY
        lastname, firstname
      ;
    `;
    db.query(sql, [], (err, result2) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query for participants without assigned employees",
        });
      }

      let participantsUnassigned = [];
      if (result2.length) {
        unassignedParticipants = result2.map((item) => {
          const { participantid, firstname, lastname } = item;
          return {
            participantid: participantid,
            firstname: firstname,
            lastname: lastname,
          };
        });
      }

      const { numParticipants } = result1[0];

      const summary = {
        numParticipants: numParticipants,
        numParticpantsUnassigned: participantsUnassigned.length,
      };

      return res.status(200).send({
        msg: "summary retrieved",
        msgType: "success",
        summary: summary,
        participantsUnassigned: participantsUnassigned,
      });
    });
  });
};
