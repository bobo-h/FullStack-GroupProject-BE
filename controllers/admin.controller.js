const User = require("../models/User");

const adminController = {};

// 모든 유저 리스트 가져오기
adminController.getAllUser = async (req, res) => {
  try {
    const allUser = await User.find({ isDeleted: false, level: "customer" });
    if (!allUser) throw new Error("유저리스트가 존재하지 않습니다.");
    res.status(200).json({ status: "success", allUser });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = adminController;
