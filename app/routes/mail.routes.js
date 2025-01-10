module.exports = (app) => {
    const multer = require("multer");
    const mail = require("../controllers/mail.controller.js");
    const upload = multer();
    // const {
    //   isAuthenticated,
    //   isAdmin,
    // } = require("../middleware/auth_middleware.js");
  
    var router = require("express").Router();
  
    router.get("/test", mail.sendMailBaocao);

    router.post("/upload", mail.main);
    router.post('/mail-upload', upload.single('files'), mail.uploadMail);
    router.post("/resetPassword", mail.ressetPassword);
  
    app.use("/api/v2/mail", router);
  };
  