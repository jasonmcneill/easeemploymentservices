exports.GET = (req, res) => {
  return res.render("register", {});
};

exports.POST = (req, res) => {
  const firstname = req.body.firstname || "";
  const lastname = req.body.lastname || "";
  const email = req.body.email || "";
  const smsphone = req.body.smsphone || "";
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

  // TODO:  Modify DB to store registration token & expiry
  // TODO:  Check DB for duplicate SMS phone numbers
  // TODO:  Normalize SMS phone number
  // TODO:  Check DB for duplicate usernames
  // TODO:  Check defaults.js file
  // TODO:  Ensure sufficient password complexity
  // TODO:  Populate DB with registration token & expiry
  // TODO:  Send e-mail with registration token

  return res
    .status(200)
    .send({ msg: "confirmation e-mail sent", msgType: "success" });
};
