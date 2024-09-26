const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  const tb_checklistc = require("../controllers/tb_checklistc.controller.js");
  const { isAuthenticated } = require("../middleware/auth_middleware.js");
  const uploader = require("../config/cloudinary.config");

  var router = require("express").Router();

  router.post(
    "/create",
    [isAuthenticated],
    tb_checklistc.createFirstChecklist
  );

  router.get(
    "/ca/:id",
    [isAuthenticated],
    tb_checklistc.checklistCalv
  );

  router.get(
    "/ca-dinh-ky/:id",
    [isAuthenticated],
    tb_checklistc.checklistCalvDinhKy
  );

  // Xuất báo cáo
  //==================================
  router.post("/cac-loai-bao-cao/:id", [isAuthenticated], tb_checklistc.createExcelTongHopCa);
  router.post("/thong-ke-tra-cuu", [isAuthenticated], tb_checklistc.createExcelThongKeTraCuu);
  router.post("/baocao", [isAuthenticated], tb_checklistc.createExcelFile);
  router.post("/thong-ke", [isAuthenticated], tb_checklistc.getThongKe);
  router.post("/thong-ke-hang-muc-quan-trong", [isAuthenticated], tb_checklistc.getThongKeHangMucQuanTrong);
  
  // Role: VIP
  //========================================== 
  router.get("/top-10-max", tb_checklistc.top10max )
  router.get("/top3", tb_checklistc.topCompletionRate);
  router.get("/list-checklist-error", tb_checklistc.getChecklistsErrorFromYesterday);
  router.get("/list-project-none", tb_checklistc.getProjectsChecklistStatus);
  router.get("/quan-ly-vi-tri", tb_checklistc.getLocationsChecklist);
  router.get("/ti-le-hoan-thanh", tb_checklistc.tiLeHoanThanh);
  router.get("/ti-le-su-co", tb_checklistc.tiLeSuco);

  // Role: GDDA
  //==========================================
  router.get("/percent-checklist-days", [isAuthenticated], tb_checklistc.getProjectChecklistDays);

  // ===========================================
  router.get("/list-checklist-error-project", [isAuthenticated], tb_checklistc.getChecklistsErrorFromWeekbyDuan)
  router.get("/list-checklist", [isAuthenticated], tb_checklistc.getChecklistsError)
  router.get("/year", [isAuthenticated], tb_checklistc.checklistYearByKhoiCV);
  router.get("/year-su-co", [isAuthenticated], tb_checklistc.checklistYearByKhoiCVSuCo);
  router.get("/percent", [isAuthenticated], tb_checklistc.checklistPercent);
  router.get("/", [isAuthenticated], tb_checklistc.getCheckListc);
  router.get("/:id", [isAuthenticated], tb_checklistc.getDetail);
  router.put("/close/:id", [isAuthenticated], tb_checklistc.close);
  router.put("/open/:id", [isAuthenticated], tb_checklistc.open);
  router.get("/update-tongC/:id1/:id2", tb_checklistc.updateTongC);
  router.put("/delete/:id", [isAuthenticated], tb_checklistc.delete);

 
  router.post(
    "/update_images/:id",
    [isAuthenticated, upload.any()],
    tb_checklistc.checklistImages
  );

  app.use("/api/v2/tb_checklistc", router);
};
