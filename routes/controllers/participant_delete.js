const db = require("../../database");

exports.POST = (req, res) => {
  // Enforce authorization
  const usertype = req.user.type;
  const allowedUsertypes = ["sysadmin", "director"];
  if (!allowedUsertypes.includes(usertype)) {
    console.log(`User (employeeid ${req.user.employeeid} is not authorized.`);
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
      .send({ msg: "participant id is missing", msgType: "error" });

  if (typeof participantid !== "number")
    return res
      .status(400)
      .send({ msg: "participant id must be a number", msgType: "error" });

  // Query:  Disassociate participant from employees
  const sql = "DELETE FROM employees__participants WHERE participantid = ?;";
  db.query(sql, [participantid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to query to disassociate participant from employees",
        msgType: "error",
      });
    }

    // Query:  Delete participant from case notes
    const sql = "DELETE FROM participants__casenotes WHERE participantid = ?;";
    db.query(sql, [participantid], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query to delete participant from case notes",
          msgType: "error",
        });
      }

      // Query:  Delete participant from placements
      const sql = "DELETE FROM placements WHERE participantid = ?;";
      db.query(sql, [participantid], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to query to delete participant from placements",
            msgType: "error",
          });
        }

        // Query:  Delete participant from time entries
        const sql = "DELETE FROM employees__timelogs WHERE participantid = ?;";
        db.query(sql, [participantid], (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "unable to query to delete participant from time logs",
              msgType: "error",
            });
          }

          // Query: Delete participant
          const sql = "DELETE FROM participants WHERE participantid = ?;";
          db.query(sql, [participantid], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).send({
                msg: "unable to query to delete participant",
                msgType: "error",
              });
            }

            return res
              .status(200)
              .send({ msg: "participant deleted", msgType: "error" });
          });
        });
      });
    });
  });
};
