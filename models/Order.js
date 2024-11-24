const mongoose = require("mongoose");
// const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;
const orderSchema = Schema(
  {
    // userId: { type: mongoose.ObjectId, ref: User, required: true },

    userId: {type: String, required: true},  // 향후 수정 필요
    name: {type: String, required: true},
    email: { type: String, required: true },
    phone: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    productId: {type: mongoose.ObjectId, ref: Product, required: true},
    productName: { type: String, required: true },
    productCategory: { type: Array, required: true }, 
    orderNum: { type: String }

  },
  { timestamps: true }
);

// 모델 생성 및 내보내기
module.exports = mongoose.model("Order", orderSchema);