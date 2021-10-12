const e = require("express");
const moment = require("moment-timezone");
const db = require("../../database");

exports.POST = async (req, res) => {
  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["sysadmin", "director", "regular"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid}) is not authorized.`);
    return res.status(401).send({
      msg: "user is not authorized for this action",
      msgType: "error",
    });
  }

  // Get parameters
  let employeeid = req.body.employeeid;

  // Set time zone variables
  const timeZone = "America/Los_Angeles"; // Using Los Angeles because it's the same time zone as EASE;
  const timeZoneOffset = moment.tz(timeZone).format("Z:00").slice(0, -3);

  // Validate
  if (typeof employeeid !== "number") {
    return res
      .status(400)
      .send({ msg: "invalid employee id", msgType: "error" });
  }

  // Prevent non-elevated user types from seeing data on other employees
  if (usertype === "regular" && req.body.employeeid !== req.user.employeeid) {
    return res.status(403).send({
      msg: "insufficient access to view specified employee",
      msgType: "error",
    });
  }

  // Calculate the "from" and "to" dates of the pay period
  let fromPayPeriodDate;
  let toPayPeriodDate;
  const thisDay = moment.tz("America/Los_Angeles").format("D");
  const thisMonth = moment.tz("America/Los_Angeles").format("M");
  const thisYear = moment.tz("America/Los_Angeles").format("YYYY");
  if (thisDay >= 11 && thisDay <= 25) {
    fromPayPeriodDate = moment(`${thisYear}-${thisMonth}-11`)
      .tz("America/Los_Angeles")
      .format("YYYY-MM-11 00:00:00");
    toPayPeriodDate = moment(`${thisYear}-${thisMonth}-25`)
      .tz("America/Los_Angeles")
      .format("YYYY-MM-25 11:59:59");
  } else if (thisDay >= 26 && thisDay <= 31) {
    fromPayPeriodDate = moment(`${thisYear}-${thisMonth}-26`)
      .tz("America/Los_Angeles")
      .format("YYYY-MM-26 00:00:00");
    toPayPeriodDate = moment(fromPayPeriodDate)
      .tz("America/Los_Angeles")
      .add(1, "month")
      .format("YYYY-MM-10 11:59:59");
  } else if (thisDay >= 1 && thisDay <= 10) {
    fromPayPeriodDate = moment
      .tz("America/Los_Angeles")
      .subtract(1, "month")
      .format("YYYY-MM-26 00:00:00");
    toPayPeriodDate = moment(`${thisYear}-${thisMonth}-10`)
      .tz("America/Los_Angeles")
      .format("YYYY-MM-10 11:59:59");
  }

  console.log(`fromPayPeriodDate: ${fromPayPeriodDate}`);
  console.log(`toPayPeriodDate: ${toPayPeriodDate}`);

  const sql = `
    SELECT 
      convert_tz(tl.entry, "-00:00", ?) AS entry, tl.type, tl.participantid, p.firstname, p.lastname
    FROM 
	    ease.employees__timelogs tl
    LEFT OUTER JOIN participants p ON p.participantid = tl.participantid
    WHERE 
	    tl.employeeid = ?
    AND
	    tl.entry BETWEEN convert_tz(?, "-00:00", ?) AND convert_tz(?, "-00:00", ?)
    ORDER BY 
	    entry
    ;
  `;
  db.query(
    sql,
    [
      timeZoneOffset,
      employeeid,
      fromPayPeriodDate,
      timeZoneOffset,
      toPayPeriodDate,
      timeZoneOffset,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .send({ msg: "unable to query for time summary", msgType: "error" });
      } else if (!result.length) {
        res
          .status(404)
          .send({ msg: "no time summary records found", msgType: "success" });
      } else {
        res
          .status(200)
          .send({
            msg: "records retrieved",
            msgType: "success",
            data: result,
            payperiod: { from: fromPayPeriodDate, to: toPayPeriodDate },
          });
      }
    }
  );
};
