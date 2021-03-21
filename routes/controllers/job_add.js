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

  const foundbyemployeeid = parseInt(req.body.foundbyemployeeid) || "";
  const employerid = parseInt(req.body.employerid) || "";
  const jobtitle = req.body.jobtitle || "";
  const hours = req.body.hours || "";
  const jobdescription = req.body.jobdescription || "";
  const contactname = req.body.contactname || "";
  const contactphone = req.body.contactphone || "";
  const contactphoneext = req.body.contactphoneext || "";
  const contactemail = req.body.contactemail || "";
  const address = req.body.address || "";
  const city = req.body.city || "";
  const state = req.body.state || "";
  const zip = req.body.zip || "";
  const jobsitedetails = req.body.jobsitedetails || "";

  // Validate

  if (typeof foundbyemployeeid !== "number" || foundbyemployeeid < 0) {
    return res
      .status(400)
      .send({ msg: "invalid foundbyemployeeid", msgType: "error" });
  }

  if (typeof employerid !== "number" || employerid <= 0) {
    return res
      .status(400)
      .send({ msg: "invalid employer id", msgType: "error" });
  }

  if (!jobtitle.length)
    return res.status(400).send({ msg: "missing job title", msgType: "error" });

  if (
    !["full time", "part time", "varies", "unpaid", "undetermined"].includes(
      hours
    )
  )
    return res.status(400).send({ msg: "missing hours", msgType: "error" });

  if (!city.length)
    return res.status(400).send({ msg: "missing city", msgType: "error" });

  if (!state.length)
    return res.status(400).send({ msg: "missing state", msgType: "error" });

  // Check whether employer still exists
  const sql = "SELECT employerid FROM employers WHERE employerid = ?;";
  db.query(sql, [employerid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query whether employer still exists",
        msgType: "error",
        error: err,
      });
    }

    if (!result.length)
      return res
        .status(404)
        .send({ msg: "employer no longer exists", msgType: "error" });

    // Validate contact e-mail
    const emailValidator = require("email-validator");
    if (contactemail.length && !emailValidator.validate(contactemail))
      return res
        .status(400)
        .send({ msg: "invalid email format", msgType: "error" });
    const contactEmailFormatted = contactemail.toLowerCase();

    // Check for duplicate job title
    const sql =
      "SELECT jobid FROM jobs WHERE employerid = ? AND jobtitle = ? ORDER BY createdAt DESC LIMIT 1;";
    db.query(sql, [employerid, jobtitle], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query whether job is a duplicate",
          msgType: "error",
        });
      }

      if (result.length)
        return res.status(403).send({
          msg: "job already exists",
          msgType: "error",
          jobid: result[0].jobid,
        });

      // Validate contact phone
      let contactphoneFormatted = contactphone;
      const validatePhone = require("../utils").validatePhone;
      if (contactphone.length) {
        const validatedPhone = validatePhone(contactphone, "us");
        const {
          isPossibleNumber,
          isValidForRegion,
          nationalFormat,
        } = validatedPhone;
        if (!isPossibleNumber)
          return res
            .status(400)
            .send({ msg: "invalid phone number", msgType: "error" });
        if (!isValidForRegion)
          return res
            .status(400)
            .send({ msg: "invalid phone number for region", msgType: "error" });
        contactphoneFormatted = nationalFormat;
      }

      // Validate contact phone extension
      if (!contactphone.length && contactphoneext.length) {
        return res.status(400).send({
          msg: "phone is required if phone extension is not blank",
          msgType: "error",
        });
      }

      // Insert the record
      const sql = `
        INSERT INTO jobs(
          foundbyemployeeid,
          employerid,
          contactname,
          contactphone,
          contactphoneext,
          contactemail,
          address,
          city,
          state,
          zip,
          hours,
          jobtitle,
          jobdescription,
          jobsitedetails,
          createdAt
        ) VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          utc_timestamp()
        );`;
      db.query(
        sql,
        [
          foundbyemployeeid,
          employerid,
          contactname,
          contactphoneFormatted,
          contactphoneext,
          contactEmailFormatted.toLowerCase(),
          address,
          city,
          state.toUpperCase(),
          zip,
          hours,
          jobtitle,
          jobdescription,
          jobsitedetails,
        ],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "unable to insert job",
              msgType: "error",
              error: err,
            });
          }

          return res.status(200).send({
            msg: "job added",
            msgType: "success",
            jobid: result.insertId,
          });
        }
      );
    });
  });
};
