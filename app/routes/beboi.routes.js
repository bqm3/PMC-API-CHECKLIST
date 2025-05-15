const multer = require("multer");

module.exports = (app) => {
  const beboi = require("../controllers/beboi.controller.js");
  const {
    isAuthenticated,
    isAdmin,
  } = require("../middleware/auth_middleware.js");
  var router = require("express").Router();

  router.get("/duan", [isAuthenticated], beboi.duanListBeBoi);
  router.get("/", [isAuthenticated], beboi.getBeBoiByMonth);
  router.get("/:date", [isAuthenticated], beboi.detailChecklistBeboi);

  router.post("/analytics", [isAuthenticated], beboi.analytics);

  app.use("/api/v2/beboi", router);
};
