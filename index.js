require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const app = express();
const cloudinary = require("cloudinary").v2;

var corsOptions = {
  origin: ["*"],

  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(express.urlencoded({ extended: true }));
app.use("/upload", express.static("public/images"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

require("./app/routes/ent_calv.route")(app);
require("./app/routes/ent_user.route")(app);

const PORT = process.env.PORT || 6868;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});