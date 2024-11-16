const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = Schema(
  {
    email: { type: String, required: true }, //unique 지움
    password: { type: String, required: true },
    name: { type: String, required: true },
    birthday: { type: Date, default: "" },
    profileImage: { type: String, default: "" },
    level: { type: String, default: "customer" }, // 2types : customer, admin
    isDeleted: { type: Boolean, default: false }, // 유저 삭제 플러그 (로그인 상태 비활성화)
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.__v;
  return obj;
};

userSchema.methods.generateToken = function () {
  const token = jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
