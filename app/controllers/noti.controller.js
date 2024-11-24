exports.notiAll = async (req, res) => {
  if(Object.keys(req.query).length === 0){
    let loadingIOS = false 
    let loadingAndroid = false 
    let resData ;
    if(loadingIOS == false){
      resData = {
        key: '2.0.7',
        type: "WARNING",
        textTitle: "PMC Checklist",
        textBody: "Phiên bản 2.0.7 đã xuất bản. Cập nhật phiên bản để có trải nghiệm tốt nhất.",
        time: 5000
      };
    }
    if(loadingAndroid == false){
      resData = {
        key: '2.0.8',
        type: "WARNING",
        textTitle: "PMC Checklist",
        textBody: "Phiên bản 2.0.8 đã xuất bản. Cập nhật phiên bản để có trải nghiệm tốt nhất.",
        time: 5000
      };
    }
    return res.status(200).json({
      message: "Thành công",
      data: resData,
    });

  } else {
    const { version, platform } = req.query;
    const keyVersionIOS = "2.0.9";
    const keyVersionAPK = "2.0.9";

    let ischeck = false; 
    let resData = "";
    let status = 0;
  
    if (
      (platform === "ios" && version === keyVersionIOS) ||
      (platform !== "ios" && version === keyVersionAPK)
    ) {
      ischeck = true;
    }
  
    if(ischeck == false){
      resData = {
        type: "WARNING",
        textTitle: "PMC Checklist",
        textBody: "Phiên bản 2.0.9 đã xuất bản. Cập nhật phiên bản để có trải nghiệm tốt nhất.",
        time: 5000,
      };
      status = "1"
    }
  
    return res.status(200).json({
      message: "Thành công",
      status: status,
      data: resData,
    });
  }
};
//1461, 1498