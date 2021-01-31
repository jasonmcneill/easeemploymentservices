const db = require("../../database");

exports.POST = (req, res) => {
  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["regular", "sysadmin", "director"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid}) is not authorized.`);
    return res.status(401).send({
      msg: "user is not authorized for this action",
      msgType: "error",
    });
  }

  const employeeid = req.user.employeeid;
  const sql = `
    SELECT
      firstname,
      lastname,
      email,
      email_personal,
      phone,
      smsphone,
      smsphonecountry,
      username
    FROM
      employees
    WHERE
      employeeid = ?
    LIMIT
      1
    ;
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
        .send({ msg: "employee not found", msgTYpe: "error" });

    return res
      .status(200)
      .send({ msg: "profile retrieved", msgType: "success", data: result[0] });
  });
};
