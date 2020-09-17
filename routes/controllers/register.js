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
  const protocol = req.body.protocol || "http://";
  const host = req.body.host || "localhost:3000";
  console.log(req.body);

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

  return res
    .status(200)
    .send({ msg: "confirmation e-mail sent", msgType: "success" });
};
