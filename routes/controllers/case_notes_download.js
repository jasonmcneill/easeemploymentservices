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
      case_notes_filesize,
      case_notes_filename,
      case_notes_filename_original,
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
      case_notes_filesize,
      case_notes_filename,
      case_notes_filename_original,
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

    const caseworkerhousing = result[0].caseworkerhousing;
    const caseworkeremployment = result[0].caseworkeremployment;
    const case_notes_filename = result[0].case_notes_filename;
    const case_notes_filepath = path.join(__dirname, `../../../ease_uploads/${case_notes_filename}`)
    const case_notes_filename_original = result[0].case_notes_filename_original;

    if (employeeid === caseworkerhousing || employeeid === caseworkeremployment) {
      mayDownloadCaseNotes = true;
    }
    if (hasElevatedPermissions) mayDownloadCaseNotes = true;

    if (!mayDownloadCaseNotes) {
      return res.status(200).send({
        msg: "not eligible to download case notes for this participant",
        msgType: "error",
      });
    }

    res.download(case_notes_filepath, case_notes_filename_original, (err) => {
      if (err) console.log(err);
    });
  });
};
