const User = require("../models/User");
const bcrpyt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const dayjs = require("dayjs");
const authController = {};

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
          .sort((a, b) => b - a)[0];

        ineligibleForRegistration =
          mostRecentDate && now.diff(mostRecentDate, "day") < 90;
      }

      if (ineligibleForRegistration) {
        throw new Error(
          "회원 탈퇴 후 90일 이내에는 동일 이메일로 회원가입이 불가능합니다."
        );
      }

      user = users.find((user) => user.isDeleted === false);
      if (user) {
        sessionToken = await user.generateToken();
        return res
          .status(200)
          .json({ status: "success", user, token: sessionToken });
      }

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
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

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
