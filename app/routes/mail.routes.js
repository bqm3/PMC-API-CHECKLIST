module.exports = (app) => {
    const mail = require("../controllers/mail.controller.js");
    // const {
    //   isAuthenticated,
    //   isAdmin,
    // } = require("../middleware/auth_middleware.js");
  
    var router = require("express").Router();
  
    router.post("/upload", mail.main);
    router.post("/resetPassword", mail.ressetPassword);
  
    app.use("/api/v2/mail", router);
  };
  