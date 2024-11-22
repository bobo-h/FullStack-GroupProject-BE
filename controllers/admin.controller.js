const User = require("../models/User");

const adminController = {};

// 모든 유저 리스트 가져오기
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
// 탈퇴 회원 but 탈퇴일로부터 90일이내 리스트 가져오기
adminController.getIneligibleUser = async (req, res) => {
  try {
    // 오늘 날짜에서 90일 전 계산
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    // 조건에 맞는 유저 검색
    const ineligibleUsers = await User.find({
      isDeleted: true, // isDeleted가 true
      level: "customer", // level이 customer
      updatedAt: { $gte: ninetyDaysAgo }, // updatedAt이 90일 이내
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
// 탈퇴 회원 but 탈퇴일로부터 90일이 지난 리스트 가져오기
adminController.getEligibleUser = async (req, res) => {
  try {
    // 오늘 날짜에서 90일 전 계산
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    // 조건에 맞는 유저 검색
    const eligibleUsers = await User.find({
      isDeleted: true, // isDeleted가 true
      level: "customer", // level이 customer
      updatedAt: { $lt: ninetyDaysAgo }, // updatedAt이 90일 이상
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

// 관리자 리스트
adminController.getAllAdmin = async (req, res) => {
  try {
    const allAdmins = await User.find({ isDeleted: false, level: "admin" });
    if (!allAdmins) throw new Error("관리자 리스트가 존재하지 않습니다.");
    res.status(200).json({ status: "success", allAdmins });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// 역할 수정
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

// 탈퇴일로부터 90일 지난 회원목록 전부 삭제
adminController.deleteAllEligibleUsers = async (req, res) => {
  try {
    // 오늘 날짜에서 90일 전 계산
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    // 조건에 맞는 유저 검색
    const eligibleUsers = await User.find({
      isDeleted: true, // isDeleted가 true
      level: "customer", // level이 customer
      updatedAt: { $lt: ninetyDaysAgo }, // updatedAt이 90일 이상
    });

    if (!eligibleUsers)
      throw new Error(
        "탈퇴일로부터 90일이 지난 회원리스트가 존재하지 않습니다."
      );
    // 유저들 삭제하기
    const result = await User.deleteMany({
      _id: { $in: eligibleUsers.map((user) => user._id) }, // 필터링된 유저들의 _id로 삭제
    });
    res.status(200).json({
      status: "success",
      message: `${result.deletedCount}명의 회원을 삭제하였습니다.`,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
// 유저 검색
adminController.getSearchUsers = async (req, res) => {
  try {
    const { search, type } = req.query;

    // 데이터를 임시 저장할 객체 생성
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

    // type에 따라 다른 함수 호출
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

    // 응답 데이터가 성공 상태인지 확인
    if (dataContainer.response?.status === "success") {
      let results =
        dataContainer.response.allUsers ||
        dataContainer.response.ineligibleUsers ||
        dataContainer.response.eligibleUsers ||
        dataContainer.response.allAdmins ||
        [];
      if (search) {
        // 검색어로 필터링
        const regex = new RegExp(search, "i");
        results = results.filter(
          (user) => regex.test(user.name) || regex.test(user.email)
        );
      }
      return res.status(200).json({ status: "success", data: results });
    }
    // 실패 상태 응답 반환
    return res
      .status(dataContainer.statusCode || 500)
      .json(dataContainer.response);
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message });
  }
};

module.exports = adminController;
