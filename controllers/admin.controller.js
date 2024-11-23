const User = require("../models/User");

const adminController = {};

adminController.getAllUser = async (req, res) => {
  try {
    const allUsers = await User.find({ isDeleted: false, level: "customer" });
    if (!allUsers) throw new Error("유저리스트가 존재하지 않습니다.");
    let response = { status: "success" };

    const totalUserNum = allUsers.length;
    response.totalUserNum = totalUserNum;
    response.allUsers = allUsers;

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

adminController.getIneligibleUser = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const ineligibleUsers = await User.find({
      isDeleted: true,
      level: "customer",
      updatedAt: { $gte: ninetyDaysAgo },
    });

    if (!ineligibleUsers)
      throw new Error(
        "탈퇴일로부터 90일 이내의 회원리스트가 존재하지 않습니다."
      );

    res.status(200).json({ status: "success", ineligibleUsers });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

adminController.getEligibleUser = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const eligibleUsers = await User.find({
      isDeleted: true,
      level: "customer",
      updatedAt: { $lt: ninetyDaysAgo },
    });

    if (!eligibleUsers)
      throw new Error(
        "탈퇴일로부터 90일이 지난 회원리스트가 존재하지 않습니다."
      );

    res.status(200).json({ status: "success", eligibleUsers });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

adminController.getAllAdmin = async (req, res) => {
  try {
    const allAdmins = await User.find({ isDeleted: false, level: "admin" });
    if (!allAdmins) throw new Error("관리자 리스트가 존재하지 않습니다.");
    res.status(200).json({ status: "success", allAdmins });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

adminController.editLevel = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { level } = req.body;

    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { level },
      { new: true }
    );
    if (!user) throw new Error("해당 유저를 찾지 못했습니다.");
    res.status(200).json({ status: "success", user });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

adminController.deleteAllEligibleUsers = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const eligibleUsers = await User.find({
      isDeleted: true,
      level: "customer",
      updatedAt: { $lt: ninetyDaysAgo },
    });

    if (!eligibleUsers)
      throw new Error(
        "탈퇴일로부터 90일이 지난 회원리스트가 존재하지 않습니다."
      );

    const result = await User.deleteMany({
      _id: { $in: eligibleUsers.map((user) => user._id) },
    });
    res.status(200).json({
      status: "success",
      message: `${result.deletedCount}명의 회원을 삭제하였습니다.`,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

adminController.getSearchUsers = async (req, res) => {
  try {
    const { search, type } = req.query;

    let dataContainer = {};
    const mockRes = {
      status: (code) => {
        dataContainer.statusCode = code;
        return mockRes;
      },
      json: (data) => {
        dataContainer.response = data;
      },
    };

    switch (type) {
      case "allUser":
        await adminController.getAllUser(req, mockRes);
        break;
      case "ineligibleUser":
        await adminController.getIneligibleUser(req, mockRes);
        break;
      case "eligibleUser":
        await adminController.getEligibleUser(req, mockRes);
        break;
      case "allAdmin":
        await adminController.getAllAdmin(req, mockRes);
        break;
      default:
        return res
          .status(400)
          .json({ status: "fail", message: "유효하지 않은 타입입니다." });
    }

    if (dataContainer.response?.status === "success") {
      let results =
        dataContainer.response.allUsers ||
        dataContainer.response.ineligibleUsers ||
        dataContainer.response.eligibleUsers ||
        dataContainer.response.allAdmins ||
        [];
      if (search) {
        const regex = new RegExp(search, "i");
        results = results.filter(
          (user) => regex.test(user.name) || regex.test(user.email)
        );
      }
      return res.status(200).json({ status: "success", data: results });
    }
    return res
      .status(dataContainer.statusCode || 500)
      .json(dataContainer.response);
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message });
  }
};

module.exports = adminController;
