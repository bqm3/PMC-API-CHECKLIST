module.exports = (app) => {
  const s0_thaydoithe = require("../controllers/s0_thaydoithe.controller.js");
  const {
    isAuthenticated,
    isAdmin,
    isRoleGD,
  } = require("../middleware/auth_middleware.js");
  var router = require("express").Router();

  router.get("/", [isAuthenticated], s0_thaydoithe.getAll);
  router.get("/:id", [isAuthenticated], s0_thaydoithe.getById_Duan);

  router.post("/create", [isRoleGD], s0_thaydoithe.create)

  router.put("/update",[isAuthenticated, isRoleGD], s0_thaydoithe.update);
  // router.put("/delete/:id", [isRoleGD], s0_thaydoithe.remove);


  app.use("/api/v2/s0-thaydoithe", router);
};
