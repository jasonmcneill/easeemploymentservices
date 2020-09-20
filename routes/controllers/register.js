exports.POST = (req, res) => {
  const firstname = req.body.firstname || "";
  const lastname = req.body.lastname || "";
  const email = req.body.email || "";
  let smsphone = req.body.smsphone || "";
  const smsphonecountry = req.body.smsphonecountry;
  const username = req.body.username || "";
  const password = req.body.password || "";
  let protocol;
  let host;
  switch (process.env.ENV) {
    case "development":
      protocol = "http:";
      host = "localhost:3000";
      break;
    case "staging":
      protocol = "https:";
      host = "staging-access.easeemploymentservices.com";
      break;
    case "production":
      protocol = "https:";
      host = "access.easeemploymentservices.com";
      break;
  }

  // Validate missing data
  if (!firstname.length)
    return res
      .status(400)
      .send({ msg: "missing first name", msgType: "error" });
  if (!lastname.length)
    return res.status(400).send({ msg: "missing last name", msgType: "error" });
  if (!email.length)
    return res.status(400).send({ msg: "missing e-mail", msgType: "error" });
  if (!username.length)
    return res.status(400).send({ msg: "missing username", msgType: "error" });
  if (!password.length)
    return res.status(400).send({ msg: "missing password", msgType: "error" });

  if (smsphone.length) {
    const validatedPhone = require("../utils").validatePhone(
      smsphone,
      smsphonecountry
    );
    if (!validatedPhone.isPossibleNumber)
      return res
        .status(400)
        .send({ msg: "mobile phone number not valid", msgType: "error" });
    if (!validatedPhone.isValidForRegion)
      return res.status(400).send({
        msg: "mobile phone number not valid for country",
        msgType: "error",
      });
    if (!validatedPhone.isValidSmsType)
      return res.status(400).send({
        msg: "mobile phone number is not sms capable",
        msgType: "error",
      });
    smsphone = validatedPhone.nationalFormat;
  }

  // TODO:  Check DB for duplicate usernames
  // TODO:  Check defaults.js file
  // TODO:  Ensure sufficient password complexity
  // TODO:  Check DB for duplicate SMS phone numbers
  // TODO:  Populate DB with registration token & expiry
  // TODO:  Send e-mail with registration token

  return res
    .status(200)
    .send({ msg: "confirmation e-mail sent", msgType: "success" });
};
