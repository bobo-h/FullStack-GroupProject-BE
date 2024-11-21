const express = require("express");
const diaryController = require("../controllers/diary.controller");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/", authController.authenticate, diaryController.createDiary);
router.get("/", authController.authenticate, diaryController.getDiaryList);
router.get(
  "/filters",
  authController.authenticate,
  diaryController.getFilterOptions
);
router.get("/:id", authController.authenticate, diaryController.getDiaryDetail);
router.put("/:id", authController.authenticate, diaryController.updateDiary);
router.delete("/:id", authController.authenticate, diaryController.deleteDiary);

module.exports = router;
