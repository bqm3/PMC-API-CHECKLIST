const multer = require("multer");
const logAction = require("../middleware/log_action.js");
const upload = multer();

module.exports = (app) => {
  const tb_checklistc = require("../controllers/tb_checklistc.controller.js");
  const tb_checklistc_chinhanh = require("../controllers/tb_checklistc_chinhanh.controller.js");
  const {
    isAuthenticated,
    isAdmin,
  } = require("../middleware/auth_middleware.js");
  const uploader = require("../config/cloudinary.config.js");
  const {
  uploadImgCaChecklist,
  resizeImage,
} = require("../middleware/upload_image.js");

  var router = require("express").Router();

  router.get("/first-checklist", tb_checklistc.firstChecklist);

  // Xuất báo cáo
  //==================================
  router.post(
    "/reports/:id",
    [isAuthenticated],
    tb_checklistc.createExcelTongHopCa
  );
  router.post(
    "/preview-reports/:id",
    [isAuthenticated],
    tb_checklistc.createPreviewReports
  );
  router.post("/baocao", [isAuthenticated], tb_checklistc.createExcelFile);
  router.post("/thong-ke", [isAuthenticated], tb_checklistc.getThongKe);
  router.post(
    "/report-article-important",
    [isAuthenticated],
    tb_checklistc.getThongKeHangMucQuanTrong
  );
  router.post(
    "/preview-report-article-important",
    [isAuthenticated],
    tb_checklistc.getPreviewThongKeHangMucQuanTrong
  );
  router.post("/report-checklist-years", tb_checklistc.getBaoCaoChecklistYear);
  router.post("/report-location-times", tb_checklistc.getBaoCaoLocationsTimes);
  router.post("/report-checklist-month", tb_checklistc.testExcel);

  // Role: VIP
  //==========================================
  router.get(
    "/list-checklist-error",
    tb_checklistc.getChecklistsErrorFromYesterday
  );
  router.get(
    "/percent-checklist-project",
    [isAuthenticated],
    tb_checklistc.getProjectsChecklistStatus
  );
  router.get(
    "/percent-checklist-project-noti",
    tb_checklistc.getProjectsChecklistStatus_Noti
  );
  router.get("/quan-ly-vi-tri", tb_checklistc.getLocationsChecklist);
  router.get(
    "/ti-le-hoan-thanh",
    [isAuthenticated],
    tb_checklistc.tiLeHoanThanh
  );
  router.get("/ti-le-su-co", [isAuthenticated], tb_checklistc.tiLeSuco);
  router.get("/su-co", [isAuthenticated], tb_checklistc.suCoChiTiet);
  router.get(
    "/report-checklist-percent-week",
    [isAuthenticated],
    tb_checklistc.reportPercentWeek
  );
  router.get(
    "/report-checklist-percent-yesterday",
    tb_checklistc.reportPercentYesterday
  );
  router.get(
    "/report-checklist-percent-a-week",
    [isAuthenticated],
    tb_checklistc.reportPercentLastWeek
  );
  router.get(
    "/report-problem-percent-week",
    [isAuthenticated],
    tb_checklistc.soSanhSuCo
  );
  router.get("/report-checklist-project-excel", tb_checklistc.createExcelDuAn);
  router.post(
    "/report-checklist-project-percent-excel",
    tb_checklistc.createExcelDuAnPercent
  );

  // Role: Chi nhánh
  //==========================================
  router.get(
    "/chi-nhanh-list-checklist-error",
    [isAuthenticated, isAdmin],
    tb_checklistc_chinhanh.getChecklistsErrorFromYesterday
  );
  router.get(
    "/chi-nhanh-percent-checklist-project",
    [isAuthenticated, isAdmin],
    tb_checklistc_chinhanh.getProjectsChecklistStatus
  );
  router.get(
    "/chi-nhanh-quan-ly-vi-tri",
    [isAuthenticated, isAdmin],
    tb_checklistc_chinhanh.getLocationsChecklist
  );
  router.get(
    "/chi-nhanh-ti-le-hoan-thanh",
    [isAuthenticated, isAdmin],
    tb_checklistc_chinhanh.tiLeHoanThanh
  );
  router.get(
    "/chi-nhanh-ti-le-su-co",
    [isAuthenticated, isAdmin],
    tb_checklistc_chinhanh.tiLeSuco
  );
  router.get(
    "/chi-nhanh-su-co",
    [isAuthenticated, isAdmin],
    tb_checklistc_chinhanh.suCoChiTiet
  );
  router.get(
    "/chi-nhanh-report-checklist-percent-week",
    [isAuthenticated, isAdmin],
    tb_checklistc_chinhanh.reportPercentWeek
  );
  router.get(
    "/chi-nhanh-report-checklist-percent-yesterday",
    [isAuthenticated, isAdmin],
    tb_checklistc_chinhanh.reportPercentYesterday
  );
  router.get(
    "/chi-nhanh-report-problem-percent-week",
    [isAuthenticated, isAdmin],
    tb_checklistc_chinhanh.soSanhSuCo
  );
  router.get(
    "/chi-nhanh-report-checklist-project-excel",
    [isAuthenticated, isAdmin],
    tb_checklistc_chinhanh.createExcelDuAn
  );

  // Role: PSH
  router.get(
    "/report-location",
    [isAuthenticated, isAdmin],
    tb_checklistc.reportLocation
  );

  // Role: GDDA
  //==========================================
  router.get(
    "/percent-checklist-days",
    [isAuthenticated],
    tb_checklistc.getProjectChecklistDays
  );

  // ===========================================
  router.get(
    "/list-checklist-error-project",
    [isAuthenticated],
    tb_checklistc.getChecklistsErrorFromWeekbyDuan
  );
  router.get(
    "/list-checklist",
    [isAuthenticated],
    tb_checklistc.getChecklistsError
  );
  router.get("/year", [isAuthenticated], tb_checklistc.checklistYearByKhoiCV);
  router.get(
    "/year-su-co",
    [isAuthenticated],
    tb_checklistc.checklistYearByKhoiCVSuCo
  );
  router.get("/percent", [isAuthenticated], tb_checklistc.checklistPercent);
  router.get("/", [isAuthenticated], tb_checklistc.getCheckListc);
  router.get("/day", [isAuthenticated], tb_checklistc.getDayCheckListc);
  router.get("/:id", [isAuthenticated], tb_checklistc.getDetail);
  router.put("/close/:id", [isAuthenticated], tb_checklistc.close);
  router.put("/open/:id", [isAuthenticated], tb_checklistc.open);
  router.get("/update-tongC/:id1/:id2", tb_checklistc.updateTongC);
  router.put("/delete/:id", [isAuthenticated, logAction], tb_checklistc.delete);
  router.post("/create", [isAuthenticated], tb_checklistc.createFirstChecklist);

  router.get("/ca/:id", [isAuthenticated], tb_checklistc.checklistCalv);

  // Tra cứu, Tìm kiếm
  router.post("/date", [isAuthenticated], tb_checklistc.checklistCalvDate);

  // router.post(
  //   "/update_images/:id",
  //   [isAuthenticated, upload.any()],
  //   tb_checklistc.checklistImages
  // );

    router.post(
    "/update_images/:id",
    [isAuthenticated, uploadImgCaChecklist.any("images"), resizeImage],
    tb_checklistc.checklistImages
  );

  router.put("/update-tongC", tb_checklistc.updateTongC2);

  app.use("/api/v2/tb_checklistc", router);
};
