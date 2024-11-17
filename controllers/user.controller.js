const User = require("../models/User");
const bcrpyt = require("bcryptjs");
const dayjs = require("dayjs"); // 날짜 계산을 위해 dayjs 사용

const userController = {};

// 회원가입
userController.createUser = async (req, res) => {
  try {
    let { email, password, name, birthday, level, profileImage } = req.body;
    // 이메일 중복검사
    const users = await User.find({ email });
    //초기값 설정
    let eligibleForRegistration = false;

    if (users.length > 0) {
      // isDeleted가 false인 사용자가 있는지 확인
      const existingActiveUser = users.find((user) => user.isDeleted === false);
      if (existingActiveUser) {
        throw new Error("이미 존재하는 유저입니다.");
      }

      // isDeleted가 true인 사용자(회원탈퇴) 중
      // 업데이트일(회원탈퇴일)로부터 90일이 지난 경우 확인
      const now = dayjs();
      eligibleForRegistration = (() => {
        const deletedUsers = users.filter(
          (user) => user.isDeleted === true && user.updatedAt
        );

        // 가장 최근 updatedAt을 찾음
        const mostRecentDate = deletedUsers
          .map((user) => dayjs(user.updatedAt))
          .sort((a, b) => b - a)[0]; // 최신 날짜가 맨 앞에 위치

        // 90일 이상 지났는지 확인
        return mostRecentDate && now.diff(mostRecentDate, "day") >= 90;
      })();

      if (!eligibleForRegistration) {
        throw new Error(
          "회원 탈퇴 후 90일 이내에는 동일 이메일로 회원가입이 불가능합니다."
        );
      }
    }

    if (eligibleForRegistration || users.length === 0 || !users) {
      // 비밀번호 암호화
      const salt = await bcrpyt.genSaltSync(10);
      password = await bcrpyt.hash(password, salt);
      const newUser = new User({
        email,
        password,
        name,
        birthday,
        level: level ? level : "customer",
        profileImage: profileImage ? profileImage : "",
      });
      await newUser.save();
      res.status(200).json({ status: "success" });
    }
  } catch (error) {
    res.status(400).json({ status: "FAIL", message: error.message });
  }
};

//토큰 정보로 유저 가져오기
userController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("토큰이 유효하지 않습니다.");
    }
    res.status(200).json({ status: "success", user });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// 회원정보 수정
userController.editUser = async (req, res) => {
  try {
    //const { id } = req.params;
    // 토큰에서 가져온 UserId
    const { userId } = req;
    const { name, birthday, profileImage } = req.body;

    if (!name) throw new Error("이름은 필수항목 값입니다.");

    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { name, birthday, profileImage },
      { new: true }
    );

    res.status(200).json({ status: "success", user });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

//회원탈퇴
userController.deleteUser = async (req, res) => {
  try {
    //const { id } = req.params;
    // 토큰에서 가져온 UserId
    const { userId } = req;
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { isDeleted: true },
      { new: true }
    );
    if (!user) throw new Error("탈퇴 가능한 유저가 존재하지 않습니다.");
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
module.exports = userController;
