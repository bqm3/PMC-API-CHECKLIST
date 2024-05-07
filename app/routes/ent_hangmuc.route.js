module.exports = (app) => {
    const ent_hangmuc = require("../controllers/ent_hangmuc.controller.js");
    const {isAuthenticated}= require('../middleware/auth_middleware.js');
  
    var router = require("express").Router();
  
    router.post("/create",[isAuthenticated], ent_hangmuc.create);
    router.get("/",[isAuthenticated], ent_hangmuc.get);
    router.get("/:id",[isAuthenticated], ent_hangmuc.getDetail);
    router.put("/update/:id",[isAuthenticated], ent_hangmuc.update);
    router.put("/delete/:id",isAuthenticated, ent_hangmuc.delete);
    router.get("/filter/:id",isAuthenticated, ent_hangmuc.filterByKhuvuc);
    router.post("/filter_qr", isAuthenticated, ent_hangmuc.filterByQr)
  
  
    app.use("/api/ent_hangmuc", router);
  };