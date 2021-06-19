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

  const participantid = req.body.participantid || "";

  // Validate

  if (participantid === "")
    return res
      .status(400)
      .send({ msg: "participant id is required", msgType: "error" });

  if (typeof participantid !== "number")
    return res
      .status(400)
      .send({ msg: "participant id must be numeric", msgType: "error" });

  // Query

  const sql = `
    SELECT
      participantid,
      caseworkerhousing,
      caseworkeremployment,
      firstname,
      lastname,
      phone,
      phonecountry,
      address,
      city,
      UCASE(state) AS state,
      zip,
      authorizationdate,
      seekshousing,
      seeksemployment,
      caseworkeremployment,
      caseworkerhousing,
      (SELECT CONCAT(firstname, " ", lastname) AS caseworkeremploymentname FROM employees WHERE employeeid = (SELECT caseworkeremployment FROM participants WHERE participantid = ?)) AS caseworkeremploymentname,
      (SELECT CONCAT(firstname, " ", lastname) AS caseworkerhousingname FROM employees WHERE employeeid = (SELECT caseworkerhousing FROM participants WHERE participantid = ?)) AS caseworkerhousingname,
      case_notes_filename,
      case_notes_filesize
    FROM
      participants
    WHERE
      participantid = ?
    LIMIT 1
    ;
  `;
  db.query(
    sql,
    [participantid, participantid, participantid],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .send({ msg: "unable to query for participant", msgType: "error" });
      }

      if (!result.length) {
        return res
          .status(404)
          .send({ msg: "no record of participant", msgType: "error" });
      }

      return res.status(200).send({
        msg: "participant retrieved",
        msgType: "success",
        data: result[0],
      });
    }
  );
};
