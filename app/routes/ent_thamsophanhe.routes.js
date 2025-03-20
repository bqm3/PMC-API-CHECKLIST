module.exports = (app) => {
    const multer = require("multer");
    const upload = multer();
    const ent_thamsophanhe = require("../controllers/hsse/ent_thamsophanhe.controller.js");
    const {
      isAuthenticated,
      isAdmin,
    } = require("../middleware/auth_middleware.js");
    const logAction = require("../middleware/log_action.js");
    
  
    var router = require("express").Router();
  
    router.post("/uploads",upload.single('files'), ent_thamsophanhe.uploads);
    router.get("/getDetail", isAuthenticated, ent_thamsophanhe.getDetail)

  
    app.use("/api/v2/ent_thamsophanhe", router);
  };
  