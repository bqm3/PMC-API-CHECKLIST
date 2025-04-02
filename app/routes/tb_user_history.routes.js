module.exports = (app) => {
  const tb_user_history = require("../controllers/tb_user_history.controller.js");
  var router = require("express").Router();


  router.get("/:id", tb_user_history.getUser)
  router.post("/create", tb_user_history.create)
  router.put("/update/:id", tb_user_history.update);


  app.use("/api/v2/user-history", router);
};
