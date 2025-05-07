module.exports = (app) => {
  const ent_tailieuphanhe = require("../controllers/ent_tailieuphanhe.controller.js");
  const { isAuthenticated } = require("../middleware/auth_middleware.js");

  var router = require("express").Router();

  router.post("/create", [isAuthenticated], ent_tailieuphanhe.create);
  router.get("/by-duan", [isAuthenticated], ent_tailieuphanhe.getByDuan);
  router.put("/delete-mul/", [isAuthenticated], ent_tailieuphanhe.deleteMul);
  router.get("/:id", [isAuthenticated], ent_tailieuphanhe.findByID);
  router.put("/:id", [isAuthenticated], ent_tailieuphanhe.update);

  app.use("/api/v2/ent_tailieuphanhe", router);
};
