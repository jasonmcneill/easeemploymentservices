const db = require("../../database");

exports.GET = (req, res) => {
  const sql =
    "SELECT employeeid, firstname, lastname, status, type FROM employees ORDER BY lastname, firstname;";

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
