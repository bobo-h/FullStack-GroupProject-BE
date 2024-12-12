const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema(
  {
    diaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    }, 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    chatbotId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatbot" },
    content: { type: String, required: true }, 
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    }, 
    likes: { type: Number, default: 0 }, 
    dislikes: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
