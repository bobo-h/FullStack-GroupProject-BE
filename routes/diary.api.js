const express = require("express");
const diaryController = require("../controllers/diary.controller");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/", authController.authenticate, diaryController.createDiary);
router.get("/", authController.authenticate, diaryController.getDiaryList);
router.get("/:id", authController.authenticate, diaryController.getDiaryDetail);

module.exports = router;
