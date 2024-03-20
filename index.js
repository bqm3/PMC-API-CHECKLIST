require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
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
app.use("/upload1", express.static("app/public/anh1"));
app.use("/upload2", express.static("app/public/anh2"));
app.use("/upload3", express.static("app/public/anh3"));
app.use("/upload4", express.static("app/public/anh4"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

require("./app/routes/ent_calv.route")(app);
require("./app/routes/ent_user.route")(app);
require("./app/routes/ent_tang.route")(app);
require("./app/routes/ent_toanha.route")(app);
require("./app/routes/ent_khuvuc.route")(app);
require("./app/routes/ent_duan.route")(app);
require("./app/routes/ent_khoicv.route")(app);
require("./app/routes/ent_checklist.route")(app);
require("./app/routes/ent_chucvu.route")(app);
require("./app/routes/ent_giamsat.route")(app);
require("./app/routes/tb_checklistc.route")(app);
require("./app/routes/tb_checklistchitiet.route")(app);

const PORT = process.env.PORT || 6868;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});