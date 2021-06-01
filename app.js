"use strict";

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const _ = require("lodash");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const routes = require("./routes/routes");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: "100mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));

// routes
app.use("/", routes);

// listen
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Node Express started on port ${port}`));
