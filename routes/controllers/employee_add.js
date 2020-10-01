const db = require("../../database");

exports.POST = (req, res) => {
  const moment = require("moment");
  const emailValidator = require("email-validator");
  const db = require("../../database");
  const firstname = req.body.firstname || "";
  const lastname = req.body.lastname || "";
  const email = req.body.email || "";
  const type = req.body.type || "";
  const startdate = req.body.startdate || "";
  const notifyemployee = req.body.notifyemployee === "yes" ? true : false;

  if (!firstname.length)
    return res
      .status(400)
      .send({ msg: "missing first name", msgType: "error" });

  if (!lastname.length)
    return res.status(400).send({ msg: "missing last name", msgType: "error" });

  if (!email.length)
    return res.status(400).send({ msg: "missing email", msgType: "error" });

  if (!emailValidator.validate(email))
    return res
      .status(400)
      .send({ msg: "invalid email format", msgType: "error" });

  if (!type.length)
    return res.status(400).send({ msg: "missing type", msgType: "error" });

  if (!startdate.length)
    return res
      .status(400)
      .send({ msg: "missing start date", msgType: "error" });

  if (!moment(startdate).isValid())
    return res
      .status(400)
      .send({ msg: "invalid start date format", msgType: "error" });

  const sql = "SELECT employeeid FROM employees WHERE email = ? LIMIT 1;";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .send({ msg: "unable to check database for duplicate email" });
    }

    if (result.length)
      return res.status(406).send({
        msg: "email is already in use",
        msgType: "error",
        employeeid: result[0].employeeid,
      });

    const startdateSql = moment(startdate).format("YYYY-MM-DD");
    const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
    const sql = `
      INSERT INTO employees(
        email,
        firstname,
        lastname,
        type,
        status,
        startdate,
        createdAt
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        'pending',
        ?,
        ?
      )
    `;
    db.query(
      sql,
      [email, firstname, lastname, type, startdateSql, createdAt],
      (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .send({ msg: "unable to insert record", msgType: "error" });
        }

        if (!notifyemployee) {
          return res.status(200).send({
            msg: "employee added",
            msgType: "success",
            employeeid: result[0].insertId,
          });
        }

        const sendEmail = require("../utils").sendEmail;
        let registerUrl = "https://access.easeemploymentservices.com/register/";
        if (process.env.ENV === "staging")
          registerUrl =
            "https://staging-access.easeemploymentservices.com/register/";
        if (process.env.ENV === "development")
          registerUrl = "http://localhost:3000/register/";
        const sender = "E.A.S.E. <no-reply@em6223.easeemploymentservices.com>";
        const recipient = `${firstname} ${lastname} <${email}>`;
        const subject = "You may now register";
        const body = `
          <p>
            This message is for ${firstname} ${lastname}. You have just been authorized to register your employee account with E.A.S.E.
          </p>

          <p>
            To register, please click on the following link and complete the form:
          </p>

          <p style="margin: 30px 0"><strong><big><a href="${registerUrl}" style="text-decoration: underline">Register</a></big></strong></p>
          
          <p>E.A.S.E. Employment Services</p>
          <div style="margin: 40px 0 20px 0">
            <small><small style="color: #ccc">
              <hr size="1" color="#ccc" />
              Message ID: ${require("uuid").v4().toUpperCase()}
            </small></small>
          </div>
        `;

        sendEmail(recipient, sender, subject, body)
          .then((result) => {
            return res.status(result[0].statusCode || 200).send({
              msg: "notification e-mail sent",
              msgType: "success",
              result: result,
            });
          })
          .catch((error) => {
            console.log(require("util").inspect(error, true, 7, true));
            return res.status(500).send({
              msg: "notification e-mail could not be sent",
              msgType: "error",
              error: error,
            });
          });
      }
    );
  });
};
