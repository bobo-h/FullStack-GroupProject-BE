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


module.exports = router;
