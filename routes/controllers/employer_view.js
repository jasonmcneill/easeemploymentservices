const db = require("../../database");

exports.GET = (req, res) => {
  const employerid = parseInt(req.params.id) || "";

  // Validate

  if (typeof employerid !== "number" || employerid < 0)
    return res
      .status(400)
      .send({ msg: "invalid employer id", msgType: "error" });

  const sql = "SELECT * FROM employers WHERE employerid = ? LIMIT 1;";
  db.query(sql, [employerid], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for employer", msgType: "error" });
    }

    return res
      .status(200)
      .send({ msg: "employer retrieved", msgType: "success", data: result[0] });
  });
};
