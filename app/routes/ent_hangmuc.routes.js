const multer = require("multer");
const upload = multer();


module.exports = (app) => {
    const ent_hangmuc = require("../controllers/ent_hangmuc.controller.js");
    const {isAuthenticated}= require('../middleware/auth_middleware.js');
    const logAction = require("../middleware/log_action.js");
  
    var router = require("express").Router();
  
    router.post("/create",[isAuthenticated], ent_hangmuc.create);
    router.get("/",[isAuthenticated], ent_hangmuc.get);
    router.get("/total", [isAuthenticated], ent_hangmuc.getHangmucTotal)
    router.get("/:id",[isAuthenticated], ent_hangmuc.getDetail);
    
    router.put("/update/:id",[isAuthenticated], ent_hangmuc.update);

    router.put("/delete/:id",[isAuthenticated, logAction], ent_hangmuc.delete);
    router.put("/delete-mul", [isAuthenticated, logAction], ent_hangmuc.deleteMul)

    router.get("/filter/:id",isAuthenticated, ent_hangmuc.filterByKhuvuc);

    router.post("/uploads", [isAuthenticated, upload.single('files')], ent_hangmuc.uploadFiles)
    router.post("/generate-qr-codes", ent_hangmuc.downloadQrCodes)
  
  
    app.use("/api/v2/ent_hangmuc", router);
  };