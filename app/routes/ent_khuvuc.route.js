module.exports = (app) => {
    const ent_khuvuc = require("../controllers/ent_khuvuc.controller.js");
    const isAuthenticated = require('../middleware/auth_middleware.js');
  
    var router = require("express").Router();
  
    router.post("/create", isAuthenticated, ent_khuvuc.create);
    router.get("/", isAuthenticated, ent_khuvuc.get);
    router.get("/:id", isAuthenticated, ent_khuvuc.getDetail);
    
    
    app.use("/api/ent_khuvuc", router);
  };