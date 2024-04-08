const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  const tb_checklistchitiet = require("../controllers/tb_checklistchitiet.controller.js");
  const { isAuthenticated } = require("../middleware/auth_middleware.js");
  const uploader = require("../config/cloudinary.config");

  var router = require("express").Router();


  router.post(
    "/create",
    [isAuthenticated, upload.any()],
    // uploader.array("Images"),
    tb_checklistchitiet.createCheckListChiTiet
  );

  router.post(
    "/filters",
    [isAuthenticated],
    tb_checklistchitiet.searchChecklist
  );
  router.get(
    "/:id",
    [isAuthenticated],
    tb_checklistchitiet.getDetail
  );

  router.post(
    '/upload-images',
    [isAuthenticated, upload.any()],
    tb_checklistchitiet.uploadImages
  )
  
  app.use("/api/tb_checklistchitiet", router);
};
