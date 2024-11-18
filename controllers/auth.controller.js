const User = require("../models/User");
const bcrpyt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const dayjs = require("dayjs"); // 날짜 계산을 위해 dayjs 사용
const authController = {};

//이메일로 로그인
authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email, isDeleted: false });

    if (user) {
      const isMatch = await bcrpyt.compare(password, user.password);
      if (isMatch) {
        const token = user.generateToken();
        return res.status(200).json({ status: "success", user, token });
      } else {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }
    }
    throw new Error("입력하신 유저가 존재하지 않습니다.");
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
authController.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();
    let users = await User.find({ email });

    // isDeleted가 true인 구글 사용자(회원탈퇴) 중
    // 업데이트일(회원탈퇴일)로부터 90일이 지나지 않은 경우를 확인
    let ineligibleForRegistration = false;
    let user = null;
    let sessionToken = null;

    if (users.length !== 0) {
      const now = dayjs();
      const deletedUsers = users.filter(
        (user) => user.isDeleted === true && user.updatedAt
      );

      if (deletedUsers.length > 0) {
        const mostRecentDate = deletedUsers
          .map((user) => dayjs(user.updatedAt))
          .sort((a, b) => b - a)[0]; // 최신 날짜가 맨 앞에 위치

        // 90일 미만이면 ineligibleForRegistration = true
        ineligibleForRegistration =
          mostRecentDate && now.diff(mostRecentDate, "day") < 90;
      }

      if (ineligibleForRegistration) {
        throw new Error(
          "회원 탈퇴 후 90일 이내에는 동일 이메일로 회원가입이 불가능합니다."
        );
      }

      // DB에 isDeleted가 false인 유저가 있는 경우
      user = users.find((user) => user.isDeleted === false);
      if (user) {
        sessionToken = await user.generateToken();
        return res
          .status(200)
          .json({ status: "success", user, token: sessionToken });
      }

      // DB에 isDeleted가 true인 유저가 있는 경우 (90일 이상 지난 상태)
      user = users.find((user) => user.isDeleted === true);
      if (user) {
        user.isDeleted = false;
        await user.save();
        sessionToken = await user.generateToken();
        return res
          .status(200)
          .json({ status: "success", user, token: sessionToken });
      }
    }

    // DB에 유저가 없는 경우 새로운 유저 생성

    const randomPassword = "" + Math.floor(Math.random() * 100000000);
    const salt = await bcrpyt.genSalt(10);
    const newPassword = await bcrpyt.hash(randomPassword, salt);

    user = new User({
      email: email,
      name: name,
      password: newPassword,
    });
    await user.save();
    sessionToken = await user.generateToken();

    return res
      .status(200)
      .json({ status: "success", user, token: sessionToken });

    //토큰발행 리턴
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// 토큰의 유효성 확인
authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) throw new Error("토큰을 찾을 수 없습니다.");
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error)
        throw new Error(
          "유효하지 않은 토큰입니다. 로그인을 다시 한번 시도해주세요."
        );
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};
module.exports = authController;
