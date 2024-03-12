module.exports = (app) => {
    const ent_user = require("../controllers/ent_user.controller.js");
  
    var router = require("express").Router();
  
    router.post("/login", ent_user.login);
    router.post("/register", ent_user.register);
    
    app.use("/api/ent_user", router);
  };