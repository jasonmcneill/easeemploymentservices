const moment = require("moment");
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

  const firstname = req.body.firstname || "";
  const lastname = req.body.lastname || "";
  const phone = req.body.phone || "";
  const phonecountry = req.body.phonecountry || "us";
  const address = req.body.address || "";
  const city = req.body.city || "";
  const state = req.body.state || "";
  const zip = req.body.zip || "";
  const authorizationdate = req.body.authorizationdate || "";
  const employeeid = req.body.employeeid || "";
  const needsEmployment = req.body.needsEmployment ? 1 : 0;
  const needsHousing = req.body.needsHousing ? 1 : 0;

  // Validate

  if (!firstname.length)
    return res
      .status(400)
      .send({ msg: "missing first name", msgType: "error" });

  if (!lastname.length)
    return res.status(400).send({ msg: "missing last name", msgType: "error" });

  if (!city.length)
    return res.status(400).send({ msg: "missing city", msgType: "error" });

  if (!state.length)
    return res.status(400).send({ msg: "missing state", msgType: "error" });

  // Validate authorization date
  if (!authorizationdate.length) return res.status(400).send({ msg: "missing authorization date", msgType: "error" });
  const isValidAuthorizationDate = moment(authorizationdate).isValid() || false;
  if (!isValidAuthorizationDate) return res.status(400).send({ msg: "invalid authorization date", msgType: "error" });

  // Validate phone number
  const validatePhone = require("../utils").validatePhone;
  let phoneValidated = phone.replace(/\D/g, "");
  if (phoneValidated != "") {
    if (phonecountry === "") {
      return res.status(400).send({
        msg: "phone country required if phone is not blank",
        msgType: "error",
      });
    }

    const phoneValidation = validatePhone(phoneValidated, phonecountry);
    if (!phoneValidation.isPossibleNumber) {
      return res
        .status(400)
        .send({ msg: "invalid phone number", msgType: "error" });
    }
    if (!phoneValidation.isValidForRegion) {
      return res
        .status(400)
        .send({ msg: "invalid phone number for region", msgType: "error" });
    }
    phoneValidated = phoneValidation.nationalFormat;
  }

  // Check for duplicates
  const sql = `SELECT participantid FROM participants WHERE firstname = ? AND lastname = ? AND phone = ? LIMIT 1`;
  db.query(sql, [firstname, lastname, phoneValidated], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query for existing participants",
        msgType: "error",
      });
    }

    if (result.length) {
      return res.status(403).send({
        msg: "participant already exists",
        msgType: "error",
        participantid: result[0].participantid,
      });
    }

    // Insert the record
    const sql = `
      INSERT INTO participants(
        firstname, lastname, phone, address, city, state, zip, authorizationdate, seekshousing, seeksemployment, createdAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, utc_timestamp()
      );
    `;
    db.query(
      sql,
      [
        firstname,
        lastname,
        phoneValidated,
        address,
        city,
        state,
        zip,
        moment(authorizationdate).format("YYYY-MM-DD"),
        needsHousing,
        needsEmployment,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .send({ msg: "unable to insert participant", msgType: "error" });
        }

        const participantid = result.insertId;

        // If no employeeid was assigned, return.
        if (employeeid === "") {
          return res.status(200).send({
            msg: "participant added",
            msgType: "success",
            participantid: participantid,
          });
        }

        // Verify employeeid is valid
        const sql = `SELECT employeeid FROM employees WHERE employeeid = ?;`;
        db.query(sql, [employeeid], (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "participant added, but unable to query for employee",
              msgType: "error",
              participantid: participantid,
              employeeid: employeeid,
            });
          }

          if (!result.length) {
            return res.status(200).send({
              msg: "participant added, but employee not found",
              msgType: "success",
              participantid: participantid,
              employeeid: employeeid,
            });
          }

          // Associate participant with employee
          const employeeidInt = parseInt(employeeid);
          const sql = `
            UPDATE
              participants
            SET
              employeeid = ?
            WHERE
              participantid = ?
            ;
          `;
          db.query(sql, [employeeidInt, participantid], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(200).send({
                msg: "participant added, but unable to associate with employee",
                msgType: "success",
                participantid: participantid,
                employeeid: employeeid,
              });
            }

            return res.status(200).send({
              msg: "participant added",
              msgType: "success",
              participantid: participantid,
            });
          });
        });
      }
    );
  });
};
