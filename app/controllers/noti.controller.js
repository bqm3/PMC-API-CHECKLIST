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
    key: 0,
    type: "WARNING",
    textTitle: "PMC Checklist",
    textBody: "Phiên bản v2 đã xuất bản. Vui lòng Checklist",
    time: 5000
  };
  return res.status(200).json({
    message: "Thành công",
    data: resData,
  });
};
