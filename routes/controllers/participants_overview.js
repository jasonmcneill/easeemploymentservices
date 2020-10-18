const db = require("../../database");

exports.GET = (req, res) => {
  const sql = `
    SELECT
      COUNT(participantid) AS numParticipants,
      (SELECT COUNT(participantid) FROM employees__participants) AS numParticipantsManaged,
      (SELECT COUNT(employeeid) FROM employees) AS numEmployees,
      (SELECT COUNT(employeeid) FROM employees__participants GROUP BY employeeid) AS numEmployeesManaging
    FROM
      participants
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
