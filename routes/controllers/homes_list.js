const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
  const timeZone = req.body.timeZone || "America/Los_Angeles";
  const timeZoneOffset = moment.tz(timeZone).format("Z:00").slice(0, -3);
  const sql = `
    SELECT
      h.homeid,
      h.hometitle,
      h.city,
      h.state,
      convert_tz(h.createdAt, '+00:00', ?) AS createdAt,
      prov.companyname
    FROM
      homes h
    INNER JOIN
      providers prov
    ON
      h.providerid = prov.providerid
    WHERE
      h.homeid NOT IN (SELECT homeid FROM housingplacements)
    ORDER BY
      h.createdAt DESC,
      h.providerid,
      h.hometitle
    ;
  `;
  db.query(sql, [timeZoneOffset], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for homes", msgType: "error" });
    }

    return res
      .status(200)
      .send({ msg: "homes retrieved", msgType: "success", data: result });
  });
};
