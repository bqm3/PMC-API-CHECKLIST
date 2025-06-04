module.exports = (app) => {
  const multer = require("multer");
  const upload = multer();
  const ent_thamsophanhe = require("../controllers/Hsse/ent_thamsophanhe.controller.js");
  const {
    isAuthenticated,
    isAdmin,
  } = require("../middleware/auth_middleware.js");
  const logAction = require("../middleware/log_action.js");

  var router = require("express").Router();

  router.post("/uploads", upload.single("files"), ent_thamsophanhe.uploads);
  router.get("/", isAuthenticated, ent_thamsophanhe.getAll);
  router.get("/getDetail", isAuthenticated, ent_thamsophanhe.getDetail);
  router.post('/create', isAuthenticated, ent_thamsophanhe.create);
  router.put('/update/:id', isAuthenticated, ent_thamsophanhe.update);

  app.use("/api/v2/ent_thamsophanhe", router);
};
