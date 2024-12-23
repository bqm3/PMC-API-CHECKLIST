module.exports = (app) => {
  const p0 = require("../controllers/p0.controller.js");
  const {
    isAuthenticated,
    isAdmin,
  } = require("../middleware/auth_middleware.js");
  var router = require("express").Router();

  router.get("/", [isAuthenticated], p0.getP0_User_ByDuAn);
  router.get("/check", [isAuthenticated], p0.checkRole);
  router.post("/create", [isAuthenticated], p0.createP0);
  router.post("/create-role", [isAuthenticated], p0.createP0_User)
  router.get("/all-duan", [isAuthenticated], p0.getAll_ByID_Duan);
  router.put("/update/:id", [isAuthenticated], p0.updateP0);

  app.use("/api/v2/p0", router);
};
