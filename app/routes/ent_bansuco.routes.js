module.exports = (app) => {
  const ent_bansuco = require("../controllers/ent_bansuco.controller.js");
  var router = require("express").Router();


  router.get("/", ent_bansuco.getAllBansuco);
  router.get("/:id", ent_bansuco.getBansucoById);
  router.post("/create", ent_bansuco.createBansuco);
  router.put("/update/:id", ent_bansuco.updateBansuco);
  router.put("/delete/:id", ent_bansuco.deleteBansuco);


  app.use("/api/v2/bansuco", router);
};
