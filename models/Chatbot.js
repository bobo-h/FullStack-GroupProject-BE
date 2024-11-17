const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");

const chatbotSchema = new Schema(
  {
    // //userId: { type: mongoose.ObjectId, ref: User },
    // userId: { type: Number, required: true, default: 1111 },
    // name: { type: String, require: true },
    // appearance: { type: String }, // visualization : true, false면 될것 같아요(?)
    // personality: { type: String, required: true },

    user_id: { type:  mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, // 메인화면에서 필요
    product_id: { type: String, ref: 'Product', required: true}, // 메인화면에서 필요 -> 기존의 appearance 대체
    name: { type: String, require: true },
    // appearance: { type: String }, // visualization : true, false면 될것 같아요(?)
    personality: { type: String, required: true },
    position: {   // 메인화면에서 필요
        x: { type: Number, default: 20 },
        y: { type: Number, default: 20 },
      },
    zIndex: { type: Number, default: 2 }, // z-index 값을 저장
    flip: { type: Boolean, default: false }, // 좌우 반전 여부를 저장
    visualization: { type: Boolean, default: true }, // true 또는 false 값을 갖는 필드
  },
  { timestamps: true }
);

chatbotSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Chatbot = mongoose.model("Chatbot", chatbotSchema);
module.exports = Chatbot;
