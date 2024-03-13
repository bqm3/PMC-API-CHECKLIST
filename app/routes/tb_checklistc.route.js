const multer = require("multer");

module.exports = (app) => {
    const tb_checklistc = require("../controllers/tb_checklistc.controller.js");
    const isAuthenticated = require('../middleware/auth_middleware.js');
    var imageMiddleware = require("../middleware/image_middleware.js");
  
    const upload = multer({
        storage: imageMiddleware.image.storage(),
        fileFilter: imageMiddleware.image.allowedImage,
    }).fields([
        {
            name:'anh1', maxCount:1
        },
        // {
        //     name:'anh2', maxCount:1
        // },
        // {
        //     name:'anh3', maxCount:1
        // },
        // {
        //     name:'anh4', maxCount:1
        // },
    ])
    var router = require("express").Router();


    router.post("/create", upload, isAuthenticated, tb_checklistc.create);
  
    app.use("/api/tb_checklistc", router);
  };