const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = (req, res) => {
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

  // Request variables
  const timeZone = req.body.timezone;
  const timeZoneOffset = moment.tz(timeZone).format("Z:00").slice(0, -3);
  const month = req.body.month || moment().tz(timeZone).format("MM");
  const year = req.body.year || moment().tz(timeZone).format("YYYY");
  const dateFirstDayOfMonth = `${year}-${month}-01`;
  const sql = `
    SELECT
      p.providerid,
      p.companyname,
      h.homeid,
      h.address,
      h.city
    FROM
      providers p
    INNER JOIN homes h ON h.providerid = p.providerid
    INNER JOIN housingplacements hp ON hp.homeid = h.homeid
    WHERE
      hp.enddate IS NULL
    OR
      hp.enddate <= LAST_DAY(CONVERT_TZ(?, '+00:00', ?))
    ORDER BY
      h.city,
      h.address,
      p.companyname
    ;
  `;
  db.query(sql, [dateFirstDayOfMonth, timeZoneOffset], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for supportive housing",
        msgType: "error",
      });
    }

    return res.status(200).send({
      msg: "supportive housing data retrieved",
      msgType: "success",
      data: result,
    });
  });
};
