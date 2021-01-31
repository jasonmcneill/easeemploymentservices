const moment = require("moment-timezone");
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

  const timeZone = req.body.timeZone || "America/Los_Angeles";
  const timeZoneOffset = moment.tz(timeZone).format("Z:00").slice(0, -3);

  const homeid = parseInt(req.body.homeid) || "";
  if (typeof homeid !== "number" || homeid <= 0) {
    return res.status(400).send({ msg: "invalid home id", msgType: "error" });
  }

  const sql = `
    SELECT
      h.homeid,
      h.providerid,
      h.foundbyemployeeid,
      h.contactname,
      h.contactphone,
      h.contactphoneext,
      LCASE(h.contactemail) AS contactemail,
      h.address,
      h.city,
      UCASE(h.state) AS state,
      h.zip,
      h.hometitle,
      h.homedescription,
      date_format(convert_tz(h.createdAt, '+00:00', ?), "%Y-%m-%d") AS createdAt,
      prov.companyname,
      par.participantid,
      par.firstname AS participantFirstName,
      par.lastname AS participantLastName,
      date_format(convert_tz(hpl.begindate, '+00:00', ?), "%Y-%m-%d") AS placementBeginDate
    FROM
      homes h
    INNER JOIN providers prov ON h.providerid = prov.providerid
    LEFT OUTER JOIN housingplacements hpl ON hpl.homeid = h.homeid
    LEFT OUTER JOIN participants par ON par.participantid = hpl.participantid
    WHERE
      h.homeid = ?
    ORDER BY
      createdAt DESC
    ;
  `;
  db.query(sql, [timeZoneOffset, timeZoneOffset, homeid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for home",
        msgType: "error",
        error: err,
      });
    }

    return res
      .status(200)
      .send({ msg: "retrieved home", msgType: "success", data: result[0] });
  });
};
