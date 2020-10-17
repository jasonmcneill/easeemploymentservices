const db = require("../../database");

exports.POST = (req, res) => {
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

  const term = req.body.term.toLowerCase() || "";

  if (!term.length)
    return res.status(400).send({
      msg: "search term must not be blank",
      msgType: "error",
    });

  const sql = `
    SELECT
      participantid, firstname, lastname
    FROM
      participants
    WHERE
      LCase(firstname) LIKE ?
    OR
      LCase(lastname) LIKE ?
    OR
      LCase(CONCAT(firstname, " ", lastname)) LIKE ?
    ORDER BY
      lastname, firstname
    ;
  `;
  db.query(sql, [`%${term}%`, `%${term}%`, `%${term}%`], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for search term", msgType: "error" });
    }

    if (!result.length)
      return res
        .status(404)
        .send({ msg: "no results found for search term", msgType: "info" });

    return res.status(200).send({
      msg: "results found for search term",
      msgType: "success",
      results: result,
    });
  });
};
