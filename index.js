require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();


var corsOptions = {
  origin: ["*"],

  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use("/upload", express.static("app/public"));

app.get("/", (req, res) => {
  res.json("Hello World!");
});

require("./app/routes/ent_calv.route")(app);
require("./app/routes/ent_user.route")(app);
require("./app/routes/ent_tang.route")(app);
require("./app/routes/ent_toanha.route")(app);
require("./app/routes/ent_khuvuc.route")(app);
require("./app/routes/ent_duan.route")(app);
require("./app/routes/ent_hangmuc.route")(app);
require("./app/routes/ent_khoicv.route")(app);
require("./app/routes/ent_checklist.route")(app);
require("./app/routes/ent_chucvu.route")(app);
require("./app/routes/ent_giamsat.route")(app);
require("./app/routes/tb_checklistc.route")(app);
require("./app/routes/tb_checklistchitiet.route")(app);
require("./app/routes/tb_checklistchitietdone.route")(app);

const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});