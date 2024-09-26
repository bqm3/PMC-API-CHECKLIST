const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  const tb_sucongoai = require("../controllers/tb_sucongoai.controller.js");
  const { isAuthenticated } = require("../middleware/auth_middleware.js");

  var router = require("express").Router();

  router.post("/create", [isAuthenticated, upload.any()], tb_sucongoai.create);
  
  router.get("/", [isAuthenticated], tb_sucongoai.get);
  router.put("/status/:id", [isAuthenticated, upload.any()], tb_sucongoai.updateStatus);
  router.get('/getDetail/:id', [isAuthenticated], tb_sucongoai.getDetail);
  router.put("/delete/:id", [isAuthenticated], tb_sucongoai.delete);
  router.get("/dashboard-by-duan", [isAuthenticated], tb_sucongoai.dashboardByDuAn);
  router.get("/dashboard", tb_sucongoai.dashboardAll);
  router.get("/su-co-ngoai", tb_sucongoai.getSucoNam);
  
  app.use("/api/v2/tb_sucongoai", router);
};


