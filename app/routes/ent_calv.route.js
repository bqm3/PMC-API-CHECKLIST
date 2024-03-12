module.exports = (app) => {
    const ent_calv = require("../controllers/ent_calv.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Ent_calv
    router.post("/", ent_calv.create);
  
    app.use("/api/ent_calv", router);
  };