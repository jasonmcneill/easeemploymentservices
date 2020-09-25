const db = require("../../database");

exports.LIST = (req, res) => {
  const sql =
    "SELECT employeeid, firstname, lastname FROM employees WHERE status = 'registered' ORDER BY lastname, firstname;";

  db.query(sql, [], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for employees", msgType: "error" });
    }

    return res.status(200).send(results);
  });
};

exports.EMPLOYEE = (req, res) => {
  const employeeid = req.params.id;
  const sql = `
    SELECT
      employeeid,
      email,
      email_personal,
      phone,
      smsphone,
      firstname,
      lastname,
      type,
      status,
      username,
      passwordmustchange,
      dateEmploymentBegan,
      dateEmploymentEnded,
      createdAt,
      updatedAt
    FROM employees
    WHERE employeeid = ?;
  `;

  db.query(sql, [employeeid], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for employee", msgType: "error" });
    }

    if (!result.length)
      return res
        .status(404)
        .send({ msg: "employee not found", msgType: "error" });

    return res.status(200).send(result);
  });
};
