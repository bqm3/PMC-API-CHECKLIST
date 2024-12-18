exports.notiAll = async (req, res) => {
  const { version, platform } = req.query;
  const keyVersionIOS = "2.1.2";
  const keyVersionAPK = "2.1.2";

  let ischeck = false;
  let resData = "";
  let status = 0;

  if (
    (platform === "ios" && version === keyVersionIOS) ||
    (platform !== "ios" && version === keyVersionAPK)
  ) {
    ischeck = true;
  }

  if (ischeck == false) {
    resData = {
      type: "WARNING",
      textTitle: "PMC Checklist",
      textBody:
        "Ai dùng điện thoại IOS vui lòng KHÔNG cập nhật phiên bản mới.",
      time: 10000,
    };
    status = "1";
  }

  return res.status(200).json({
    message: "Thành công",
    status: status,
    data: resData,
  });
};

