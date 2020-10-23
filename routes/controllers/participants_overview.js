const db = require("../../database");

exports.GET = (req, res) => {
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

  const sql = `
    SELECT
      (SELECT COUNT(participantid) FROM participants) AS numParticipants,
      (SELECT COUNT(participantid) FROM employees__participants) AS numParticipantsManaged,
      (SELECT COUNT(employeeid) FROM employees) AS numEmployees,
      (SELECT COUNT(employeeid) FROM employees__participants) AS numEmployeesManaging
    ;
  `;
  db.query(sql, [], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for summary", msgType: "error" });
    }

    const {
      numParticipants,
      numParticipantsManaged,
      numEmployees,
      numEmployeesManaging,
    } = result[0];
    const summary = {
      numParticipants: numParticipants,
      numParticipantsUnassigned: numParticipants - numParticipantsManaged,
      numEmployees: numEmployees,
      numEmployeesUnassigned: numEmployees - numEmployeesManaging,
    };
    return res.status(200).send({
      msg: "summary retrieved",
      msgType: "success",
      summary: summary,
    });
  });
};
