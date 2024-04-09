const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  const tb_checklistc = require("../controllers/tb_checklistc.controller.js");
  const { isAuthenticated } = require("../middleware/auth_middleware.js");
  const uploader = require("../config/cloudinary.config");

  var router = require("express").Router();

  router.post(
    "/create-first",
    [isAuthenticated],
    tb_checklistc.createFirstChecklist
  );

  router.get("/", [isAuthenticated], tb_checklistc.getCheckListc);
  router.get("/:id", [isAuthenticated], tb_checklistc.getDetail);
  router.put("/close/:id", [isAuthenticated], tb_checklistc.close);

  router.put(
    "/update-images/:id",
    [isAuthenticated, upload.any()],
    tb_checklistc.checklistImages
  );

  app.use("/api/tb_checklistc", router);
};
