const db = require("../../database");

exports.GET = (req, res) => {
  const sql =
    "SELECT employeeid, firstname, lastname, status, type FROM employees ORDER BY lastname, firstname;";

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

  // Query
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
