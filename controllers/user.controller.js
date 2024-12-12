const User = require("../models/User");
const bcrpyt = require("bcryptjs");
const dayjs = require("dayjs");

const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { email, password, name, birthday, level, profileImage } = req.body;

    const users = await User.find({ email });

    let eligibleForRegistration = false;

    if (users.length > 0) {
      const existingActiveUser = users.find((user) => user.isDeleted === false);
      if (existingActiveUser) {
        throw new Error("이미 존재하는 유저입니다.");
      }

      const now = dayjs();
      eligibleForRegistration = (() => {
        const deletedUsers = users.filter(
          (user) => user.isDeleted === true && user.updatedAt
        );

        const mostRecentDate = deletedUsers
          .map((user) => dayjs(user.updatedAt))
          .sort((a, b) => b - a)[0];

        return mostRecentDate && now.diff(mostRecentDate, "day") >= 90;
      })();

      if (!eligibleForRegistration) {
        throw new Error(
          "회원 탈퇴 후 90일 이내에는 동일 이메일로 회원가입이 불가능합니다."
        );
      }
    }

    if (eligibleForRegistration || users.length === 0 || !users) {
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

userController.editUser = async (req, res) => {
  try {
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

userController.deleteUser = async (req, res) => {
  try {
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
