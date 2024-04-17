module.exports = (app) => {
  const ent_khuvuc = require("../controllers/ent_khuvuc.controller.js");
  const { isAuthenticated, isAdmin } = require("../middleware/auth_middleware");

  var router = require("express").Router();

  router.post("/create", [isAuthenticated], ent_khuvuc.create);
  router.get("/", isAuthenticated, ent_khuvuc.get);
  router.get("/filter",isAuthenticated, ent_khuvuc.getKhuVuc);
  router.get("/:id", isAuthenticated, ent_khuvuc.getDetail);
  router.put("/delete/:id",isAuthenticated, ent_khuvuc.delete);
  router.put("/update/:id",isAuthenticated, ent_khuvuc.update);

  app.use("/api/ent_khuvuc", router);
};
