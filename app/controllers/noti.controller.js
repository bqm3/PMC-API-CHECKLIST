const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const { Op } = require("sequelize");
const fetch = require("node-fetch");
const moment = require("moment-timezone");

exports.notiAll = async (req, res) => {
    // 0 la k goi thong bao
    // 1 la goi thong bao
  const resData = {
    key: '2.0.6',
    type: "WARNING",
    textTitle: "PMC Checklist",
    textBody: "Phiên bản 2.0.5 đã xuất bản. Cập nhật phiên bản để có trải nghiệm tốt nhất.",
    time: 5000
  };
  return res.status(200).json({
    message: "Thành công",
    data: resData,
  });
};
//1461, 1498