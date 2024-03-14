module.exports = (app) => {
    const ent_toanha = require("../controllers/ent_toanha.controller.js");
    const {isAuthenticated, isAdmin}= require('../middleware/auth_middleware.js');
  
    var router = require("express").Router();
  
    router.post("/create",[isAuthenticated, isAdmin],ent_toanha.create);
    router.get("/", isAuthenticated,ent_toanha.get);
    
    
    app.use("/api/ent_toanha", router);
  };