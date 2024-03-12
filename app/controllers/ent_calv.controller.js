const ent_calv = require("../models/ent_calv.model");


// Create and Save a new ent_calv
exports.create = (req, res) => {
  // Validate request
  if (!req.body.Tenca ) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }else if(!req.body.Giobatdau || !req.body.Gioketthuc){
    res.status(400).send({
        message: "Time can not be empty!",
      });
      return;
  }

  // Create a ent_calv
  const data = {
    ID_Duan: req.body.ID_Duan,
    ID_KhoiCV: req.body.ID_KhoiCV,
    Tenca:  req.body.Tenca,
    Giobatdau: req.body.Giobatdau,
    Gioketthuc: req.body.Gioketthuc,
    ID_User: req.body.ID_User,
    isDelete: req.body.isDelete
  };

  // Save ent_calv in the database
  ent_calv.create(data)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the ent_calv.",
      });
    });
};
