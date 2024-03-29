module.exports = (app) => {
    const ent_user = require("../controllers/ent_user.controller.js");
    const {isAuthenticated, isAdmin}= require('../middleware/auth_middleware.js');
  
    var router = require("express").Router();
  
    router.post("/register", [isAuthenticated, isAdmin],ent_user.register);
    router.post("/change-password",[isAuthenticated], ent_user.changePassword);
    router.post("/delete-user",[isAuthenticated, isAdmin], ent_user.deleteUser);
    router.post("/login", ent_user.login);
    router.get("/get-online",[isAuthenticated,isAdmin], ent_user.getUserOnline);
    
    
    app.use("/api/ent_user", router);
  };