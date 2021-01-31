const db = require("../../database");

exports.GET = (req, res) => {
  const employeeid = req.params.id;
  const sql = `
    SELECT
      employeeid,
      LCASE(email) AS email,
      LCASE(email_personal) AS email_personal,
      phone,
      smsphone,
      smsphonecountry,
      firstname,
      lastname,
      type,
      status,
      LCASE(username) AS username,
      passwordmustchange,
      startdate,
      enddate,
      createdAt,
      updatedAt
    FROM employees
    WHERE employeeid = ?;
  `;

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
