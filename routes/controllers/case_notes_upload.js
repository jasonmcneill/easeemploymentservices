const db = require("../../database");
const fs = require("fs");
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

  if (typeof participantid !== "number") {
    return res.status(400).send({
      msg: "participant id in the form must be an integer",
      msgType: "error",
    });
  }

  const sql = `
    SELECT
      case_notes_filename
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
    LIMIT
      1
    ;
  `;
  db.query(sql, [participantid, employeeid, employeeid], (err, result1) => {
    if (err) {
      console.log(err);
      return res.status(400).send({
        msg: "unable to query to verify eligibility to upload case notes",
        msgType: "error",
      });
    }

    const usertype = req.user.type;
    const hasElevatedPermissions =
      ["sysadmin", "director"].includes(usertype) || false;

    if (result1.length !== 1 && !hasElevatedPermissions) {
      return res.status(403).send({
        msg: "user is not authorized to upload case notes for this participant",
        msgType: "error",
      });
    }

    // Update database about uploaded file
    const sql = `
      UPDATE
        participants
      SET
        case_notes_filename = ?,
        case_notes_filename_original = ?,
        case_notes_mimetype = ?,
        case_notes_filesize = ?
      WHERE
        participantid = ?
      ;
    `;
    db.query(
      sql,
      [
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        participantid,
      ],
      (err, result2) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to update database about uploaded file",
            msgType: "error",
            err: err,
          });
        }

        // Delete old file (if it exists). Otherwise "fs.unlink" will silently error out.
        const fileToDelete = result1.length
          ? path.join(
              __dirname,
              `../../casenotes/${result1[0].case_notes_filename}`
            )
          : null;
        fs.unlink(fileToDelete, (err) => {
          return res
            .status(200)
            .send({ msg: "upload successful", msgType: "success" });
        });
      }
    );
  });
};
