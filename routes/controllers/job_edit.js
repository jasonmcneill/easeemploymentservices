const db = require("../../database");

exports.POST = (req, res) => {
  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["director", "sysadmin"];
  if (!allowedUsertypes.includes(usertype)) {
    return res.status(401).send({
      msg: "user is not authorized for this action",
      msgType: "error",
    });
  }

  const address = req.body.address || "";
  const city = req.body.city || "";
  const contactemail = req.body.contactemail || "";
  const contactname = req.body.contactname || "";
  const contactphone = req.body.contactphone || "";
  const contactphoneext = req.body.contactphoneext || "";
  const employerid = parseInt(req.body.employerid) || "";
  const foundbyemployeeid = parseInt(req.body.foundbyemployeeid) || "";
  const hours = req.body.hours || "";
  const jobdescription = req.body.jobdescription || "";
  const jobid = parseInt(req.body.jobid) || "";
  const jobsitedetails = req.body.jobsitedetails || "";
  const jobtitle = req.body.jobtitle || "";
  const state = req.body.state || "";
  const zip = req.body.zip || "";
  const filledby = parseInt(req.body.filledby) || "";
  const noLongerOnTheMarket =
    req.body.noLongerOnTheMarket === true ? true : false;

  // Validate

  if (typeof jobid !== "number" || jobid < 0) {
    return res.status(400).send({ msg: "invalid jobid", msgType: "error" });
  }

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

  if (!["full time", "part time", "varies", "undetermined"].includes(hours))
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
      "SELECT jobid FROM jobs WHERE employerid = ? AND jobtitle = ? AND jobid <> ? ORDER BY createdAt DESC LIMIT 1;";
    db.query(sql, [employerid, jobtitle, jobid], (err, result) => {
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

      const sql = `
        UPDATE
          jobs
        SET
          employerid = ?,
          foundbyemployeeid = ?,
          contactname = ?,
          contactphone = ?,
          contactphoneext = ?,
          contactemail = ?,
          address = ?,
          city = ?,
          state = ?,
          zip = ?,
          hours = ?,
          jobtitle = ?,
          jobdescription = ?,
          jobsitedetails = ?
        WHERE
          jobid = ?
        ;
      `;

      db.query(
        sql,
        [
          employerid,
          foundbyemployeeid,
          contactname,
          contactphoneFormatted,
          contactphoneext,
          contactEmailFormatted,
          address,
          city,
          state,
          zip,
          hours,
          jobtitle,
          jobdescription,
          jobsitedetails,
          jobid,
        ],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "unable to update job",
              msgType: "error",
              error: err,
            });
          }

          // Remove job and its references if no longer on the market
          if (noLongerOnTheMarket) {
            const sql = `DELETE FROM jobplacements__notes WHERE placementid = (SELECT placementid FROM jobplacements WHERE jobid = ? LIMIT 1);`;
            db.query(sql, [jobid], (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).send({
                  msg:
                    "unable to delete associated placement notes for this job",
                  msgType: "error",
                  error: err,
                  jobid: jobid,
                });
              }

              const sql = `DELETE FROM jobplacements WHERE jobid = ?;`;
              db.query(sql, [jobid], (err, result) => {
                if (err) {
                  console.log(err);
                  return res.status(500).send({
                    msg: "unable to delete placements for this job",
                    msgType: "error",
                    error: err,
                    jobid: jobid,
                  });
                }

                const sql = `DELETE FROM jobs WHERE jobid = ?;`;
                db.query(sql, [jobid], (err, result) => {
                  if (err) {
                    console.log(err);
                    return res.status(500).send({
                      msg: "unable to delete job",
                      msgType: "error",
                      error: err,
                      jobid: jobid,
                    });
                  }

                  return res
                    .status(200)
                    .send({ msg: "job deleted", msgType: "success" });
                });
              });
            });
          } else {
            // Remove placement
            const sql =
              "SELECT placementid FROM jobplacements WHERE jobid = ? LIMIT 1;";
            db.query(sql, [jobid], async (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).send({
                  msg: "unable to retrieve placements",
                  msgType: "error",
                  error: err,
                });
              }

              if (!result.length) {
                // Insert placement
                if (typeof filledby === "number") {
                  const sql = `
                    INSERT INTO jobplacements (
                      jobid,
                      participantid,
                      begindate,
                      createdAt
                    ) VALUES (
                      ?,
                      ?,
                      utc_timestamp(),
                      utc_timestamp()
                    )
                  `;
                  db.query(sql, [jobid, filledby], (err, response) => {
                    if (err) {
                      console.log(err);
                      return res.status(500).send({
                        msg: "unable to insert placement",
                        msgType: "error",
                        error: err,
                      });
                    }

                    return res
                      .status(200)
                      .send({ msg: "job updated", msgType: "success" });
                  });
                } else {
                  return res
                    .status(200)
                    .send({ msg: "job updated", msgType: "success" });
                }
              } else {
                // Delete placement notes
                const sql =
                  "DELETE FROM jobplacements__notes WHERE placementid = (SELECT placementid FROM jobplacements WHERE jobid = ? LIMIT 1);";
                db.query(sql, [jobid], (err, result) => {
                  if (err) {
                    console.log(err);
                    return res.status(500).send({
                      msg: "unable to delete placement notes",
                      msgType: "error",
                      error: err,
                    });
                  }

                  // Delete placements
                  const sql = "DELETE FROM jobplacements WHERE jobid = ?;";
                  db.query(sql, [jobid], (err, result) => {
                    if (err) {
                      console.log(err);
                      return res.status(500).send({
                        msg: "unable to delete jobplacements",
                        msgType: "error",
                        error: err,
                      });
                    }

                    if (typeof filledby !== "number")
                      return res
                        .status(200)
                        .send({ msg: "job updated", msgType: "success" });

                    const sql = `
                      INSERT INTO jobplacements (
                        jobid,
                        participantid,
                        begindate,
                        createdAt
                      ) VALUES (
                        ?,
                        ?,
                        utc_timestamp(),
                        utc_timestamp()
                      )
                    `;
                    db.query(sql, [jobid, filledby], (err, result) => {
                      if (err) {
                        console.log(err);
                        return res.status(500).send({
                          msg: "unable to insert placement",
                          msgType: "error",
                          error: err,
                        });
                      }

                      return res
                        .status(200)
                        .send({ msg: "job updated", msgType: "success" });
                    });
                  });
                });
              }
            });
          }
        }
      );
    });
  });
};
