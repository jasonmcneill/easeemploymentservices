const db = require("../../database");

exports.GET = (req, res) => {
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

  const sql =
    "SELECT providerid, companyname, city, UCASE(state) AS state FROM providers ORDER BY companyname;";
  db.query(sql, [], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for providers", msgType: "error" });
    }

    return res.send({
      msg: "providers retrieved",
      msgType: "success",
      data: result,
    });
  });
};
