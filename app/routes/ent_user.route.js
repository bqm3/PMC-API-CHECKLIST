module.exports = (app) => {
    const ent_user = require("../controllers/ent_user.controller.js");
    const isAuthenticated = require('../middleware/auth_middleware.js');
  
    var router = require("express").Router();
  
    router.post("/register", ent_user.register);
    router.post("/change-password",isAuthenticated, ent_user.changePassword);
    router.post("/delete-user",isAuthenticated, ent_user.deleteUser);
    router.post("/login", ent_user.login);
    
    
    app.use("/api/ent_user", router);
  };