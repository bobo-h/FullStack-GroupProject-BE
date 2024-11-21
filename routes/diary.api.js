const express = require("express");
const diaryController = require("../controllers/diary.controller");
const authController = require("../controllers/auth.controller");
const commentController = require("../controllers/comment.controller");

const router = express.Router();

// 다이어리 생성 직후, 챗봇들 댓글 생성
router.post(
  "/",
  authController.authenticate,
  diaryController.createDiary,
  commentController.createChatbotMessage
);
router.get("/", authController.authenticate, diaryController.getDiaryList);
router.get("/:id", authController.authenticate, diaryController.getDiaryDetail);
router.put("/:id", authController.authenticate, diaryController.updateDiary);
router.delete("/:id", authController.authenticate, diaryController.deleteDiary);

module.exports = router;
