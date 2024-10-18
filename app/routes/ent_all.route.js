module.exports = (app) => {
  const ent_all = require("../controllers/ent_all.controller.js");
  var router = require("express").Router();

  router.get("/ent_nhom/all", ent_all.getNhom);
  router.get("/ent_chinhanh/all", ent_all.getChinhanh);
  router.get("/ent_linhvuc/all", ent_all.getLinhvuc);
  router.get("/ent_loaihinh/all", ent_all.getLoaihinh);
  router.get("/ent_phanloai/all", ent_all.getPhanloai);

  app.use("/api/v2", router);
};