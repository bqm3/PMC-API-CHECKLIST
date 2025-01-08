const multer = require("multer");
const upload = multer();


module.exports = (app) => {
    const sql = require("../controllers/sql.controller.js");
    const ketoan = require("../controllers/ketoan.controller.js");
    var router = require("express").Router();
  
    // router.get("/test", sql.testExcel);
    router.get("/checklist",sql.checklist)
    router.post("/sql", sql.query);
    router.post("/uploads", [upload.single('files')], ketoan.uploadFiles)
  
    app.use("/api/v2/query", router);
  };
  