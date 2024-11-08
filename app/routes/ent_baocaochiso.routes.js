const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  const ent_baocaochiso = require("../controllers/ent_baocaochiso.controller.js");
  const { isAuthenticated, isAdmin } = require("../middleware/auth_middleware.js");

  var router = require("express").Router();

//   router.post("/create", [isAuthenticated, upload.any()], ent_baocaochiso.uploadFiles)

  app.use("/api/v2/ent_baocaochiso", router);
};
