const multer = require("multer");
const upload = multer();

const { uploadSuCongNgoai, resizeImage } = require("../middleware/upload_image.js");
const logAction = require("../middleware/log_action.js");

module.exports = (app) => {
  const tb_sucongoai = require("../controllers/tb_sucongoai.controller.js");
  const { isAuthenticated, isAdmin } = require("../middleware/auth_middleware.js");

  var router = require("express").Router();

  router.post("/create", [isAuthenticated, uploadSuCongNgoai.any("images"), resizeImage, logAction], tb_sucongoai.create);

  router.get("/", [isAuthenticated], tb_sucongoai.get);
  router.put("/status/:id", [isAuthenticated, uploadSuCongNgoai.any("images"), resizeImage, logAction], tb_sucongoai.updateStatus);
  router.get("/getDetail/:id", [isAuthenticated], tb_sucongoai.getDetail);
  router.put("/delete/:id", [isAuthenticated, logAction], tb_sucongoai.delete);
  router.get("/dashboard-by-duan", [isAuthenticated], tb_sucongoai.dashboardByDuAn);
  router.get("/dashboard", [isAuthenticated],  tb_sucongoai.dashboardAll);
  router.get("/su-co-ngoai", tb_sucongoai.getSucoNam);
  router.get("/report-incident-percent-week", tb_sucongoai.getSucoNam);
  router.get("/report-external-incident-percent-week", tb_sucongoai.getSuCoBenNgoai);
  router.post("/report-uploads", [isAuthenticated, upload.single("files")], tb_sucongoai.uploadReports);

  // ===================================
  router.get("/chi-nhanh-report-external-incident-percent-week", [isAuthenticated, isAdmin], tb_sucongoai.getSuCoBenNgoaiChiNhanh);
  router.get("/chi-nhanh-su-co-ngoai", [isAuthenticated, isAdmin], tb_sucongoai.getSuCoNamChiNhanh);
  router.get("/chi-nhanh-dashboard", [isAuthenticated, isAdmin], tb_sucongoai.dashboardAllChiNhanh);

  router.get("/duan-upload", tb_sucongoai.getDuanUploadSCN);

  app.use("/api/v2/tb_sucongoai", router);
};
