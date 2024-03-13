module.exports = (app) => {
    const ent_duan = require("../controllers/ent_duan.controller.js");
    const isAuthenticated = require('../middleware/auth_middleware.js');

    var router = require("express").Router();
  
    router.post("/create",isAuthenticated, ent_duan.create);
    router.get("/",isAuthenticated, ent_duan.get);
    router.get("/:id",isAuthenticated, ent_duan.getDetail);
  
    app.use("/api/ent_duan", router);
  };