module.exports = (app) => {
    const ent_khoicv = require("../controllers/ent_khoicv.controller.js");
    const {isAuthenticated}= require('../middleware/auth_middleware.js');

    var router = require("express").Router();
  
    router.get("/",[isAuthenticated], ent_khoicv.get);
    router.get("/:id",[isAuthenticated], ent_khoicv.getDetail);
  
    app.use("/api/ent_khoicv", router);
  };