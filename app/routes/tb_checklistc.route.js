const multer = require("multer");

module.exports = (app) => {
  const tb_checklistc = require("../controllers/tb_checklistc.controller.js");
  const { isAuthenticated } = require("../middleware/auth_middleware.js");
  const uploader = require("../config/cloudinary.config");

  var router = require("express").Router();

  router.post(
    "/create",
    [isAuthenticated],
    uploader.array("images", 4),
    tb_checklistc.createCheckList
  );
  router.post(
    "/create-first",
    [isAuthenticated],
    tb_checklistc.createFirstChecklist
  );
  
  router.get(
    "/",
    [isAuthenticated],
    tb_checklistc.getCheckListc
  );
  router.get(
    "/:id",
    [isAuthenticated],
    tb_checklistc.getDetail
  );
  
  app.use("/api/tb_checklistc", router);
};
