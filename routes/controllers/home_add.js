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
  const providerid = parseInt(req.body.providerid) || "";
  const hometitle = req.body.hometitle || "";
  const homedescription = req.body.homedescription || "";
  const contactname = req.body.contactname || "";
  const contactphone = req.body.contactphone || "";
  const contactphoneext = req.body.contactphoneext || "";
  const contactemail = req.body.contactemail || "";
  const address = req.body.address || "";
  const city = req.body.city || "";
  const state = req.body.state || "";
  const zip = req.body.zip || "";

  // Validate

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
      "SELECT homeid FROM homes WHERE providerid = ? AND hometitle = ? ORDER BY createdAt DESC LIMIT 1;";
    db.query(sql, [providerid, hometitle], (err, result) => {
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

      // Insert the record
      const sql = `
        INSERT INTO homes(
          foundbyemployeeid,
          providerid,
          contactname,
          contactphone,
          contactphoneext,
          contactemail,
          address,
          city,
          state,
          zip,
          hometitle,
          homedescription,
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
          utc_timestamp()
        );`;
      db.query(
        sql,
        [
          foundbyemployeeid,
          providerid,
          contactname,
          contactphoneFormatted,
          contactphoneext,
          contactEmailFormatted.toLowerCase(),
          address,
          city,
          state.toUpperCase(),
          zip,
          hometitle,
          homedescription,
        ],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "unable to insert home",
              msgType: "error",
              error: err,
            });
          }

          return res.status(200).send({
            msg: "home added",
            msgType: "success",
            homeid: result.insertId,
          });
        }
      );
    });
  });
};
