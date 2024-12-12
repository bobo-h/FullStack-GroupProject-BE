const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");

const chatbotSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, 
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, require: true },
    personality: { type: String, required: true },
    position: {
      x: { type: Number, default: 40 },
      y: { type: Number, default: 40 },
    },
    defaultPosition: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    zIndex: { type: Number, default: 2 }, 
    flip: { type: Boolean, default: false }, 
    visualization: { type: Boolean, default: true }, 
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
