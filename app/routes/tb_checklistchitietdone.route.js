module.exports = (app) => {
    const tb_checklistchitietdone = require("../controllers/tb_checklistchitietdone.controller.js");
    const {isAuthenticated}= require('../middleware/auth_middleware.js');

    var router = require("express").Router();
  
    router.post("/create",[isAuthenticated], tb_checklistchitietdone.create);
    router.get("/",[isAuthenticated], tb_checklistchitietdone.getDataFormat);
    // router.put("/update/:id",[isAuthenticated], tb_checklistchitietdone.update);
    // router.put("/delete/:id",[isAuthenticated], tb_checklistchitietdone.delete);
  
    app.use("/api/tb_checklistchitietdone", router);
  };