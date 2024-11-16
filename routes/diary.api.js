const express = require("express");
const diaryController = require("../controllers/diary.controller");
// const authController = require("../controllers/auth.controller");

// const router = express.Router();

// authController.authenticate, 추후 추가 예정
router.post("/", diaryController.createDiary);
router.get("/", diaryController.getDiaryList);

module.exports = router;
