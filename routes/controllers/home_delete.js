const db = require("../../database");

exports.POST = (req, res) => {
  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["director", "sysadmin"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid}) is not authorized.`);
    return res.status(401).send({
      msg: "user is not authorized for this action",
      msgType: "error",
    });
  }

  function deleteHome(id) {
    const sql = "DELETE FROM homes WHERE homeid = ?;";
    db.query(sql, [homeid], (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .send({ msg: "unable to delete home", msgType: "error" });
      }

      return res.status(200).send({ msg: "home deleted", msgType: "error" });
    });
  }

  const homeid = parseInt(req.body.id) || "";

  if (typeof homeid !== "number" || homeid <= 0) {
    return res.status(400).send({ msg: "invalid home id", msgType: "error" });
  }

  // Get placements for this home
  const sql =
    "SELECT housingplacementid FROM housingplacements WHERE homeid = ?;";
  db.query(sql, [homeid], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for home placements", msgType: "error" });
    }

    if (!result.length) return deleteHome(homeid);

    // Delete placement notes
    const housingplacements = result.map((item) => item);
    const sql =
      "DELETE FROM housingplacements__notes WHERE housingplacementid IN ?;";
    db.query(sql, [housingplacements], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to delete from housing placement notes",
          msgType: "error",
        });
      }

      // Delete housing placements
      const sql = "DELETE FROM housingplacements WHERE homeid = ?;";
      db.query(sql, [homeid], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to delete from placements",
            msgType: "error",
          });
        }

        // Delete home
        return deleteHome(homeid);
      });
    });
  });
};
