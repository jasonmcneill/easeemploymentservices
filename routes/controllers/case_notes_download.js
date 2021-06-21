const db = require("../../database");
const path = require("path");

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

  const employeeid = req.user.employeeid;
  const participantid = parseInt(Math.abs(req.body.participantid)) || "";

  // Enforce eligibility to download case notes
  let mayDownloadCaseNotes = false;
  const hasElevatedPermissions = ["sysadmin", "director"].includes(usertype);
  let sql = `
    SELECT
      caseworkerhousing,
      caseworkeremployment,
      case_notes_blob,
      case_notes_filesize,
      case_notes_filename,
      case_notes_mimetype
    FROM
      participants
    WHERE
      participantid = ?
    AND
      (
        caseworkerhousing = ?
        OR
        caseworkeremployment = ?
      )
    LIMIT 1
    ;
  `;
  if (hasElevatedPermissions) {
    sql = `
    SELECT
      caseworkerhousing,
      caseworkeremployment,
      case_notes_blob,
      case_notes_filesize,
      case_notes_filename,
      case_notes_mimetype
    FROM
      participants
    WHERE
      participantid = ?
    LIMIT 1
    ;
  `;
  }
  db.query(sql, [participantid, employeeid, employeeid], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to query for participant", msgType: "error" });
    }

    if (!result.length) {
      return res
        .status(404)
        .send({ msg: "participant not found", msgType: "error" });
    }

    const {
      caseworkerhousing,
      caseworkeremployment,
      case_notes_blob,
      case_notes_filesize,
      case_notes_filename,
      case_notes_mimetype,
    } = result[0];
    if (employeeid === caseworkerhousing || employee === caseworkeremployment) {
      mayDownloadCaseNotes = true;
    }
    if (hasElevatedPermissions) mayDownloadCaseNotes = true;

    if (!mayDownloadCaseNotes) {
      return res.status(200).send({
        msg: "not eligible to download case notes for this participant",
        msgType: "error",
      });
    }

    return res.status(200).send({
      msg: "file retrieved",
      msgType: "success",
      blob: case_notes_blob,
      filesize: case_notes_filesize,
      filename: case_notes_filename,
      mimetype: case_notes_mimetype,
    });
  });
};
