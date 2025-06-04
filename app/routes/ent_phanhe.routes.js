module.exports = (app) => {
  const multer = require("multer");
  const ent_phanhe = require("../controllers/ent_phanhe.controller.js");
  const {
    isAuthenticated,
  } = require("../middleware/auth_middleware.js");
  const logAction = require("../middleware/log_action.js");

  var router = require("express").Router();
  router.get("/", isAuthenticated, ent_phanhe.getAll);
  router.post("/create", isAuthenticated, ent_phanhe.create);
  router.put("/update/:id", isAuthenticated, ent_phanhe.update);
  router.put("/delete/:id", isAuthenticated, ent_phanhe.softDelete);

  app.use("/api/v2/ent_phanhe", router);
};
