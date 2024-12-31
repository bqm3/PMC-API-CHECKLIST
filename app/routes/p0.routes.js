const logAction = require("../middleware/log_action.js");

module.exports = (app) => {
  const p0 = require("../controllers/p0.controller.js");
  const {
    isAuthenticated,
    isAdmin,
  } = require("../middleware/auth_middleware.js");
  var router = require("express").Router();

  router.get("/", [isAuthenticated], p0.getP0_User_ByDuAn);
  router.get("/check", [isAuthenticated], p0.checkRole);
  router.post("/create", [isAuthenticated, logAction], p0.createP0);
  router.post("/create-role", [isAuthenticated], p0.createP0_User)
  router.get("/all-duan", [isAuthenticated], p0.getAll_ByID_Duan);
  router.get("/:id", [isAuthenticated], p0.getDetailP0);
  router.put("/update/:id", [isAuthenticated], p0.updateP0);

  app.use("/api/v2/p0", router);
};
