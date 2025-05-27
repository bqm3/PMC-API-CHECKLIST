const logAction = require("../middleware/log_action.js");

module.exports = (app) => {
  const ent_hsse_user = require("../controllers/Hsse/ent_hsse_user.controller.js");
  const {
    isAuthenticated,
    isAdmin,
  } = require("../middleware/auth_middleware.js");
  var router = require("express").Router();
  const multer = require('multer');
  const upload = multer({ storage: multer.memoryStorage() });


  router.get("/", [isAuthenticated], ent_hsse_user.getHSSE_User_ByDuAn);
  router.post("/create", [isAuthenticated], ent_hsse_user.createHSSE);
  router.post("/create/psh", [isAuthenticated], ent_hsse_user.createHSSE_PSH);
  router.post("/create-role", [isAuthenticated], ent_hsse_user.createHSSE_User);
  router.post("/check", [isAuthenticated], ent_hsse_user.checkSubmitHSSE);
  router.get("/find", [isAuthenticated], ent_hsse_user.checkHSSE);
  router.get("/all", [isAuthenticated], ent_hsse_user.getHSSE);
  router.get("/admin", [isAuthenticated], ent_hsse_user.getHSSEAll);
  router.get("/admin-warning", ent_hsse_user.getWarningHsseYesterday);
  router.get("/canhbao-xathai", ent_hsse_user.canhBaoXaThai);
  router.get("/duan-khongnhap-xathai", ent_hsse_user.duan_khongnhap_xathai);
  router.get("/:id", [isAuthenticated], ent_hsse_user.getDetailHSSE);
  router.put("/update/:id", [isAuthenticated], ent_hsse_user.updateHSSE);
  router.put(
    "/update/psh/:id",
    [isAuthenticated],
    ent_hsse_user.updateHSSE_PSH
  );

  router.post("/export-excel", [isAuthenticated], ent_hsse_user.exportExcel)
  router.post("/import-excel", [isAuthenticated], upload.single('file'), ent_hsse_user.importExcel)
  app.use("/api/v2/hsse", router);
};
