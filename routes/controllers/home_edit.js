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
  const providerid = parseInt(req.body.providerid) || "";
  const foundbyemployeeid = parseInt(req.body.foundbyemployeeid) || "";
  const homedescription = req.body.homedescription || "";
  const homeid = parseInt(req.body.homeid) || "";
  const hometitle = req.body.hometitle || "";
  const state = req.body.state || "";
  const zip = req.body.zip || "";
  const filledby = parseInt(req.body.filledby) || "";
  const noLongerOnTheMarket =
    req.body.noLongerOnTheMarket === true ? true : false;

  // Validate

  if (typeof homeid !== "number" || homeid < 0) {
    return res.status(400).send({ msg: "invalid homeid", msgType: "error" });
  }

  if (typeof foundbyemployeeid !== "number" || foundbyemployeeid < 0) {
    return res
      .status(400)
      .send({ msg: "invalid foundbyemployeeid", msgType: "error" });
  }

  if (typeof providerid !== "number" || providerid <= 0) {
    return res
      .status(400)
      .send({ msg: "invalid provider id", msgType: "error" });
  }

  if (!hometitle.length)
    return res
      .status(400)
      .send({ msg: "missing home title", msgType: "error" });

  if (!city.length)
    return res.status(400).send({ msg: "missing city", msgType: "error" });

  if (!state.length)
    return res.status(400).send({ msg: "missing state", msgType: "error" });

  // Check whether housing provider still exists
  const sql = "SELECT providerid FROM providers WHERE providerid = ?;";
  db.query(sql, [providerid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query whether provider still exists",
        msgType: "error",
        error: err,
      });
    }

    if (!result.length)
      return res
        .status(404)
        .send({ msg: "provider no longer exists", msgType: "error" });

    // Validate contact e-mail
    const emailValidator = require("email-validator");
    if (contactemail.length && !emailValidator.validate(contactemail))
      return res
        .status(400)
        .send({ msg: "invalid email format", msgType: "error" });
    const contactEmailFormatted = contactemail.toLowerCase();

    // Check for duplicate home title
    const sql =
      "SELECT homeid FROM homes WHERE providerid = ? AND hometitle = ? AND homeid <> ? ORDER BY createdAt DESC LIMIT 1;";
    db.query(sql, [providerid, hometitle, homeid], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query whether home is a duplicate",
          msgType: "error",
        });
      }

      if (result.length)
        return res.status(403).send({
          msg: "home already exists",
          msgType: "error",
          homeid: result[0].homeid,
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
          homes
        SET
          providerid = ?,
          foundbyemployeeid = ?,
          contactname = ?,
          contactphone = ?,
          contactphoneext = ?,
          contactemail = ?,
          address = ?,
          city = ?,
          state = ?,
          zip = ?,
          hometitle = ?,
          homedescription = ?
        WHERE
          homeid = ?
        ;
      `;

      db.query(
        sql,
        [
          providerid,
          foundbyemployeeid,
          contactname,
          contactphoneFormatted,
          contactphoneext,
          contactEmailFormatted,
          address,
          city,
          state,
          zip,
          hometitle,
          homedescription,
          homeid,
        ],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "unable to update home",
              msgType: "error",
              error: err,
            });
          }

          // Remove home and its references if no longer on the market
          if (noLongerOnTheMarket) {
            const sql = `DELETE FROM housingplacements__notes WHERE placementid = (SELECT placementid FROM housingplacements WHERE homeid = ? LIMIT 1);`;
            db.query(sql, [homeid], (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).send({
                  msg:
                    "unable to delete associated housing placement notes for this home",
                  msgType: "error",
                  error: err,
                  homeid: homeid,
                });
              }

              const sql = `DELETE FROM housingplacements WHERE homeid = ?;`;
              db.query(sql, [homeid], (err, result) => {
                if (err) {
                  console.log(err);
                  return res.status(500).send({
                    msg: "unable to delete housing placements for this home",
                    msgType: "error",
                    error: err,
                    homeid: homeid,
                  });
                }

                const sql = `DELETE FROM homes WHERE homeid = ?;`;
                db.query(sql, [homeid], (err, result) => {
                  if (err) {
                    console.log(err);
                    return res.status(500).send({
                      msg: "unable to delete home",
                      msgType: "error",
                      error: err,
                      homeid: homeid,
                    });
                  }

                  return res
                    .status(200)
                    .send({ msg: "home deleted", msgType: "success" });
                });
              });
            });
          } else {
            // Remove housing placement
            const sql =
              "SELECT placementid FROM housingplacements WHERE homeid = ? LIMIT 1;";
            db.query(sql, [homeid], async (err, result) => {
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
                    INSERT INTO housingplacements (
                      homeid,
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
                  db.query(sql, [homeid, filledby], (err, response) => {
                    if (err) {
                      console.log(err);
                      return res.status(500).send({
                        msg: "unable to insert housing placement",
                        msgType: "error",
                        error: err,
                      });
                    }

                    return res
                      .status(200)
                      .send({ msg: "home updated", msgType: "success" });
                  });
                } else {
                  return res
                    .status(200)
                    .send({ msg: "home updated", msgType: "success" });
                }
              } else {
                // Delete housing placement notes
                const sql =
                  "DELETE FROM housingplacements__notes WHERE placementid = (SELECT placementid FROM housingplacements WHERE homeid = ? LIMIT 1);";
                db.query(sql, [homeid], (err, result) => {
                  if (err) {
                    console.log(err);
                    return res.status(500).send({
                      msg: "unable to delete housing placement notes",
                      msgType: "error",
                      error: err,
                    });
                  }

                  // Delete housing placements
                  const sql = "DELETE FROM housingplacements WHERE homeid = ?;";
                  db.query(sql, [homeid], (err, result) => {
                    if (err) {
                      console.log(err);
                      return res.status(500).send({
                        msg: "unable to delete housing placements",
                        msgType: "error",
                        error: err,
                      });
                    }

                    if (typeof filledby !== "number")
                      return res
                        .status(200)
                        .send({ msg: "home updated", msgType: "success" });

                    const sql = `
                      INSERT INTO hosuingplacements (
                        homeid,
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
                    db.query(sql, [homeid, filledby], (err, result) => {
                      if (err) {
                        console.log(err);
                        return res.status(500).send({
                          msg: "unable to insert housing placement",
                          msgType: "error",
                          error: err,
                        });
                      }

                      return res
                        .status(200)
                        .send({ msg: "home updated", msgType: "success" });
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
