module.exports = (app) => {
  const ent_tailieuphanhe = require("../controllers/ent_tailieuphanhe.controller.js");
  const { isAuthenticated } = require("../middleware/auth_middleware.js");

  var router = require("express").Router();

  router.post("/create", [isAuthenticated], ent_tailieuphanhe.create);
  router.get("/by-duan", [isAuthenticated], ent_tailieuphanhe.getByDuan);

  app.use("/api/v2/ent_tailieuphanhe", router);
};
