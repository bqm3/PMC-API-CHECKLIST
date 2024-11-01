
module.exports = (app) => {
    const ai_controller = require("../controllers/ai.controller.js");
    var router = require("express").Router();
  
    router.get("/ai", ai_controller.tiLeHoanThanh);
  
    app.use("/api/v2", router);
  };
  