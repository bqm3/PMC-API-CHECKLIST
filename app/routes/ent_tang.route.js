module.exports = (app) => {
    const ent_tang = require("../controllers/ent_tang.controller.js");
    const isAuthenticated = require('../middleware/auth_middleware.js');
  
    var router = require("express").Router();
  
    router.post("/", isAuthenticated, ent_tang.create);
  
    app.use("/api/ent_tang", router);
  };