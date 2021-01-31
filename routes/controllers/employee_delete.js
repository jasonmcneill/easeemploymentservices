const db = require("../../database");

exports.POST = (req, res) => {
  const employeeid = parseInt(req.body.employeeid) || "";
  const employeeid_of_requestor = req.user.employeeid || "";

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

  // Validate param type
  if (typeof employeeid !== "number")
    return res
      .status(400)
      .send({ msg: "invalid employee id", msgType: "error" });

  // Prevent deleting oneself
  if (employeeid == employeeid_of_requestor)
    return res
      .status(400)
      .send({ msg: "cannot delete oneself", msgType: "error" });

  // Check DB
  const sql =
    "SELECT firstname, lastname, employeeid FROM employees WHERE employeeid = ? LIMIT 1;";
  db.query(sql, [employeeid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for employeeid",
        msgType: "error",
        error: err,
      });
    }

    if (!result.length)
      return res
        .status(404)
        .send({ msg: "no record of employeeid", msgType: "error" });

    const firstname = result[0].firstname;
    const lastname = result[0].lastname;

    // Delete the employee
    const sql = "DELETE FROM employees WHERE employeeid = ?;";
    db.query(sql, [employeeid], (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .send({ msg: "unable to delete employeeid", msgType: "error" });
      }

      return res.status(200).send({
        msg: "employee deleted",
        msgType: "success",
        name: `${firstname} ${lastname}`,
      });
    });
  });
};
