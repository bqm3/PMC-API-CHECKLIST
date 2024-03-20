module.exports = (app) => {
    const ent_calv = require("../controllers/ent_calv.controller.js");
    const {isAuthenticated}= require('../middleware/auth_middleware.js');
  
    var router = require("express").Router();
  
    // Create a new Ent_calv
    router.post("/create",[isAuthenticated], ent_calv.create);
    router.get("/",[isAuthenticated], ent_calv.get);
    router.get("/:id",[isAuthenticated], ent_calv.getDetail);
    router.put("/update/:id",[isAuthenticated], ent_calv.update);
    router.put("/delete/:id",[isAuthenticated], ent_calv.delete);
  
    app.use("/api/ent_calv", router);
  };