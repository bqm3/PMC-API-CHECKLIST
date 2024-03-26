module.exports = (app) => {
    const ent_checklist = require("../controllers/ent_checklist.controller.js");
    const {isAuthenticated}= require('../middleware/auth_middleware.js');
  
    var router = require("express").Router();
  
    router.post("/create",[isAuthenticated], ent_checklist.create);
    router.get("/",[isAuthenticated], ent_checklist.get);
    router.get("/:id",[isAuthenticated], ent_checklist.getDetail);
    router.post("/filter",isAuthenticated, ent_checklist.getFilter);
    router.put("/update/:id",[isAuthenticated], ent_checklist.update);
    router.put("/delete/:id",[isAuthenticated], ent_checklist.delete);

    app.use("/api/ent_checklist", router);
  };