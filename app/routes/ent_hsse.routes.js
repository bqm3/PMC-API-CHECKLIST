module.exports = (app) => {
    const ent_hsse_user = require("../controllers/Hsse/ent_hsse_user.controller.js");
    const {
        isAuthenticated,
        isAdmin,
      } = require("../middleware/auth_middleware.js");
    var router = require("express").Router();
  
    router.get("/", [isAuthenticated], ent_hsse_user.getHSSE_User_ByDuAn)
    
    router.post("/create", [isAuthenticated], ent_hsse_user.createHSSE_User);
    
    router.post('/check', [isAuthenticated],ent_hsse_user.checkSubmitHSSE)
    
    app.use("/api/v2/hsse", router);
  };
  