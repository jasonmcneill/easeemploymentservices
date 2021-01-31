const validUrl = require("valid-url");
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

  const companyname = req.body.companyname || "";
  const website = req.body.website || "";
  const phone = req.body.phone || "";
  const phonecountry = req.body.phonecountry || "";
  const address = req.body.address || "";
  const city = req.body.city || "";
  const state = req.body.state || "";
  const zip = req.body.zip || "";

  // Validate

  if (!companyname.length)
    return res
      .status(400)
      .send({ msg: "missing company name", msgType: "error" });

  if (website.length && !validUrl.isUri(website))
    return res.status(400).send({ msg: "invalid website", msgType: "error" });

  if (!phone.length)
    return res.status(400).send({ msg: "missing phone", msgType: "error" });

  if (!phonecountry.length)
    return res
      .status(400)
      .send({ msg: "missing phone country", msgType: "error" });

  if (!address.length)
    return res.status(400).send({ msg: "missing address", msgType: "error" });

  if (!city.length)
    return res.status(400).send({ msg: "missing city", msgType: "error" });

  if (!state.length)
    return res.status(400).send({ msg: "missing state", msgType: "error" });

  if (!zip.length)
    return res.status(400).send({ msg: "missing zip", msgType: "error" });

  // Check for duplicate company name

  const sql = "SELECT providerid FROM providers WHERE companyname = ? LIMIT 1;";
  db.query(sql, [companyname], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for duplicate company name",
        msgType: "error",
      });
    }

    if (result.length)
      return res.status(403).send({
        msg: "company name already exists",
        msgType: "error",
        providerid: result[0].providerid,
      });

    // Check for duplicate phone

    const sql = "SELECT providerid FROM providers WHERE phone = ? LIMIT 1;";
    db.query(sql, [phone], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query for duplicate phone number",
          msgType: "error",
        });
      }

      if (result.length)
        return res.status(403).send({
          msg: "phone number already exists",
          msgType: "error",
          providerid: result[0].providerid,
        });

      // Check for duplicate web site

      const sql = "SELECT providerid FROM providers WHERE website = ? LIMIT 1;";
      db.query(sql, [website], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to query for duplicate website",
            msgType: "error",
          });
        }

        if (result.length)
          return res.status(403).send({
            msg: "website already exists",
            msgType: "error",
            providerid: result[0].providerid,
          });

        const validatedPhone = require("../utils").validatePhone(
          phone,
          phonecountry
        );

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

        // Insert the record

        const sql = `
          INSERT INTO
            providers(
              companyname,
              website,
              phone,
              phonecountry,
              address,
              city,
              state,
              zip,
              createdAt
            )
          VALUES(
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            utc_timestamp()
          );
        `;
        db.query(
          sql,
          [
            companyname,
            website.toLowerCase(),
            nationalFormat,
            phonecountry,
            address,
            city,
            state.toUpperCase(),
            zip,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).send({
                msg: "unable to insert new provider",
                msgType: "error",
              });
            }

            return res.status(200).send({
              msg: "provider added successfully",
              msgType: "success",
              providerid: result.insertId,
            });
          }
        );
      });
    });
  });
};
