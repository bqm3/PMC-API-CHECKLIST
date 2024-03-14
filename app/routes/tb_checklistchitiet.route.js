const multer = require("multer");

module.exports = (app) => {
  const tb_checklistchitiet = require("../controllers/tb_checklistchitiet.controller.js");
  const { isAuthenticated } = require("../middleware/auth_middleware.js");
  const uploader = require("../config/cloudinary.config");

  var router = require("express").Router();

  router.post(
    "/create",
    [isAuthenticated],
    uploader.single("image"),
    tb_checklistchitiet.createCheckListChiTiet
  );

  router.get(
    "/",
    [isAuthenticated],
    tb_checklistchitiet.getCheckListChiTiet
  );
  router.get(
    "/:id",
    [isAuthenticated],
    tb_checklistchitiet.getDetail
  );
  
  app.use("/api/tb_checklistchitiet", router);
};
