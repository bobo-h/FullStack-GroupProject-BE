// 관리자 유저가 나중에 기분을 추가 할 수 있게 하기 위함
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const moodSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true }, // 기분 이름
  image: { type: String, required: true },
  description: { type: String, required: true },
  isDeleted: { type: String, default: "No" },
});

module.exports = mongoose.model("Mood", moodSchema);
