const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema(
  {
    diaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    }, // 게시글 ID
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 댓글 작성자
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 댓글 작성자
    chatbotId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatbot" },
    content: { type: String, required: true }, // 댓글 내용
    //userType: { type: String, required: true }, // Human or AI
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    }, // 부모 댓글
    likes: { type: Number, default: 0 }, // 좋아요 수
    dislikes: { type: Number, default: 0 }, // 싫어요 수
  },
  { timestamps: true }
);

// const commentSchema = new Schema(
//   {
//     diaryId: { type: Schema.Types.ObjectId, ref: "Diary", required: true }, // 연결된 일기 ID
//     parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null }, // 부모 댓글 ID (대댓글 기능)
//     authorId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // 댓글 작성자 ID
//     content: { type: String, required: true }, // 댓글 내용
//     isBot: { type: Boolean, default: false }, // AI 고양이 댓글 여부
//     isEdited: { type: Boolean, default: false }, // 수정됨 여부
//   },
//   { timestamps: true }
// );

// // 댓글 수정 여부를 위한 미들웨어
// commentSchema.pre("save", function (next) {
//   if (this.isModified("content")) {
//     this.isEdited = true;
//   }
//   next();
// });

module.exports = mongoose.model("Comment", commentSchema);
