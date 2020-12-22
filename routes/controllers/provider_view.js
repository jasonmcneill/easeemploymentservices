const db = require("../../database");

exports.GET = (req, res) => {
  const providerid = parseInt(req.params.id) || "";

  // Validate

  if (typeof providerid !== "number" || providerid < 0)
    return res
      .status(400)
      .send({ msg: "invalid provider id", msgType: "error" });

  const sql = "SELECT * FROM providers WHERE providerid = ? LIMIT 1;";
  db.query(sql, [providerid], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for provider", msgType: "error" });
    }

    return res
      .status(200)
      .send({ msg: "provider retrieved", msgType: "success", data: result[0] });
  });
};
