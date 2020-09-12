exports.GET = (req, res) => {
  return res.render("login", {});
};

exports.POST = (req, res) => {
  const db = require("../../database");
  const username = req.username;
  const password = req.password;

  res.status(404).send({
    msg: "authentication failed",
    msgType: "error",
    refreshToken: "",
    accessToken: "",
  });
};
