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

  // Validate
  if (typeof participantid !== "number") {
    return res.status(400).send({
      msg: "participant id in the form must be an integer",
      msgType: "error",
    });
  }

  // Enforce eligibility to upload case notes
  let mayUploadCaseNotes = false;
  const hasElevatedPermissions = ["sysadmin", "director"].includes(usertype);
  const sql = `
    SELECT
      caseworkerhousing,
      caseworkeremployment
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
  db.query(sql, [participantid, employeeid, employeeid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query to determine eligiblity to upload",
        msgType: "error",
      });
    }

    if (result.length === 1) mayUploadCaseNotes = true;
    if (hasElevatedPermissions) mayUploadCaseNotes = true;

    if (!mayUploadCaseNotes) {
      const fileToDelete = path.join(
        __dirname,
        `../../../uploads/${req.file.filename}`
      );

      fs.unlink(fileToDelete, (err) => {
        if (err) {
          console.log(err);
        }
        return res.status(200).send({
          msg: "not eligible to upload case notes for this participant",
          msgType: "error",
        });
      });
    }

    const caseNotesDirectory = path.join(
      __dirname,
      `../../../casenotes/${participantid}`
    );

    // Delete old directory for case notes
    fs.rmdir(caseNotesDirectory, { recursive: true }, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to delete old case notes file",
          msgType: "error",
        });
      }

      // Create new directory for case notes
      fs.mkdir(caseNotesDirectory, { recursive: true }, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to create directory",
            msgType: "error",
          });
        }

        // Move uploaded file from uploads directory to new directory
        const uploadsFilePath = path.join(
          __dirname,
          `../../../uploads/${req.file.filename}`
        );
        const caseNotesFilePath = path.join(
          __dirname,
          `../../../casenotes/${participantid}/${req.file.originalname}`
        );
        fs.rename(uploadsFilePath, caseNotesFilePath, (err) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "unable to move uploaded file",
              msgType: "error",
            });
          }

          // Update database
          const sql = `
            UPDATE
              participants
            SET
              case_notes_filename = ?,
              case_notes_mimetype = ?,
              case_notes_filesize = ?
            WHERE
              participantid = ?
            ;
          `;
          db.query(
            sql,
            [
              req.file.originalname,
              req.file.mimetype,
              req.file.size,
              participantid,
            ],
            (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).send({
                  msg: "unable to update database for uploaded file",
                  msgType: "error",
                });
              }

              return res
                .status(200)
                .send({ msg: "upload successful", msgType: "success" });
            }
          );
        });
      });
    });
  });
};
