module.exports = (app) => {
  const lb_yeucauKH = require("../controllers/lb_yeucau_kh.controller");
  var router = require("express").Router();
  const { isAuthenticated, isAdmin } = require("../middleware/auth_middleware.js");
  const { uploadImgCaChecklist } = require("../middleware/upload_image.js");

  router.get("/:id", isAuthenticated, lb_yeucauKH.getDetail);
  router.get("/", isAuthenticated, lb_yeucauKH.getAll);
  router.post("/create",[isAuthenticated, uploadImgCaChecklist.any("images")], lb_yeucauKH.create);
  router.put("/delete/:id", isAuthenticated, lb_yeucauKH.softDelete);

  app.use("/api/v2/yeucau-kh", router);
};
