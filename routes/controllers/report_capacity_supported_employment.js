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
      e.employerid,
      e.companyname,
      j.jobid,
      j.address,
      j.city
    FROM
      employers e
    INNER JOIN jobs j ON j.employerid = e.employerid
    INNER JOIN jobplacements jp ON jp.jobid = j.jobid
    WHERE
      jp.enddate IS NULL
    OR
      jp.enddate <= LAST_DAY(CONVERT_TZ(?, '+00:00', ?))
    ORDER BY
      j.city,
      j.address,
      e.companyname
    ;
  `;
  db.query(sql, [dateFirstDayOfMonth, timeZoneOffset], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for supported employment",
        msgType: "error",
      });
    }

    return res.status(200).send({
      msg: "supported employment data retrieved",
      msgType: "success",
      data: result,
    });
  });
};
