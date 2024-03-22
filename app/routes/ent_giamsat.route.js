module.exports = (app) => {
    const ent_giamsat = require("../controllers/ent_giamsat.controller.js");
    const {isAuthenticated}= require('../middleware/auth_middleware.js');

    var router = require("express").Router();
  
    router.post("/create",[isAuthenticated], ent_giamsat.create);
    router.get("/",[isAuthenticated], ent_giamsat.get);
    router.get("/:id",[isAuthenticated], ent_giamsat.getDetail);
    router.put("/update/:id",[isAuthenticated], ent_giamsat.update);
    router.put("/delete/:id",[isAuthenticated], ent_giamsat.delete);
  
    app.use("/api/ent_giamsat", router);
  };