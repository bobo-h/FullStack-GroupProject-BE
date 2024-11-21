const express = require("express");
const commentController = require("../controllers/comment.controller");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post(
  "/create",
  authController.authenticate,
  commentController.createComment
);
router.get(
  "/:diaryId",
  authController.authenticate,
  commentController.getComment
);

// 댓글 라우터 정의
// Get
// Post create[+쳇봇 -> creat 정의하실때 (req,res,next)형식으로 하시면 될 것 같아요(?)]/
// router.post("/??", (유저 인증),(댓글 생성),(쳇봇 컨트롤러))

module.exports = router;
