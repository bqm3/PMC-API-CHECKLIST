module.exports = (app) => {
    const ent_hsse_user = require("../controllers/Hsse/ent_hsse_user.controller");
    const {
        isAuthenticated,
        isAdmin,
      } = require("../middleware/auth_middleware.js");
    var router = require("express").Router();
  
    // Create a new ent_hsse_user
    router.put("/ent_hsse_user", [isAuthenticated], ent_hsse_user.createHSSE_User);
    
    app.use("/api/v2", router);
  };
  