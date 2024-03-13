module.exports = (app) => {
    const ent_checklist = require("../controllers/ent_checklist.controller.js");
    const isAuthenticated = require('../middleware/auth_middleware.js');
  
    var router = require("express").Router();
  
    router.post("/create",isAuthenticated, ent_checklist.create);
    router.get("/",isAuthenticated, ent_checklist.get);
    router.get("/:id",isAuthenticated, ent_checklist.getDetail);
  
    app.use("/api/ent_checklist", router);
  };