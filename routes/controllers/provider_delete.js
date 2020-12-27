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

  const providerid = parseInt(req.body.providerid) || "";

  if (typeof providerid !== "number")
    return res
      .status(400)
      .send({ msg: "invalid provider id", msgType: "error" });

  // DELETE PROVIDER
  const sql = "DELETE FROM providers WHERE providerid = ?;";
  db.query(sql, [providerid], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({
        msg: "unable to delete provider",
        msgType: "error",
        error: err,
      });
    }

    // GET HOMES BY PROVIDER
    const sql = "SELECT homeid FROM homes WHERE providerid = ?;";
    db.query(sql, [providerid], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          msg: "unable to query for homes by provider",
          msgType: "error",
          error: err,
        });
      }

      if (!result.length)
        return res
          .status(200)
          .send({ msg: "provider deleted", msgType: "success" });

      const homes = result;

      // DELETE HOMES BY PROVIDER
      const sql = "DELETE FROM homes WHERE providerid = ?;";
      db.query(sql, [providerid], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send({
            msg: "unable to delete homes by provider",
            msgType: "error",
            error: err,
          });
        }

        // GET HOUSING PLACEMENTS PER HOME
        const sql =
          "SELECT placementid FROM housingplacements WHERE homeid IN (?);";
        const homesSql = homes.forEach((item, index) => {
          let response = "";
          if (index !== 0) response += ",";
          response += item;
        });

        db.query(sql, [homesSql], (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send({
              msg: "unable to query for home placements",
              msgType: "error",
              error: err,
            });
          }

          if (!result.length)
            return res
              .status(200)
              .send({ msg: "provider deleted", msgType: "success" });

          const housingplacements = result;

          // DELETE HOUSING PLACEMENTS PER HOME
          const sql = "DELETE FROM housingplacements WHERE homeid IN ?;";
          const placementsSql = housingplacements.forEach((item, index) => {
            let response = "";
            if (index !== 0) response += ",";
            response += item;
          });
          db.query(sql, [placementsSql], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).send({
                msg: "unable to delete home placements",
                msgType: "error",
                error: err,
              });
            }

            // GET PLACEMENT NOTES PER HOUSING PLACEMENT
            const sql =
              "SELECT noteid FROM housingplacements WHERE placementid IN ?;";
            db.query(sql, [placementsSql], (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).send({
                  msg: "unable to query for placement notes",
                  msgType: "error",
                  error: err,
                });
              }

              if (!result.length)
                return res
                  .status(200)
                  .send({ msg: "provider deleted", msgType: "success" });

              const notes = result;

              // DELETE PLACEMENT NOTES PER HOUSING PLACEMENT
              const sql =
                "DELETE FROM housingplacements__notes WHERE placementid IN ?;";
              const notesSql = notes.forEach((item, index) => {
                let response = "";
                if (index !== 0) response += ",";
                response += item;
              });
              db.query(sql, [notesSql], (err, result) => {
                if (err) {
                  console.log(err);
                  return res.status(500).send({
                    msg: "unable to delete placement notes",
                    msgType: "error",
                    error: err,
                  });
                }

                // ALL DONE
                return res
                  .status(200)
                  .send({ msg: "provider deleted", msgType: "success" });
              });
            });
          });
        });
      });
    });
  });
};
