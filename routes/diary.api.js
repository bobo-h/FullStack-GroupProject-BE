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
router.get(
  "/deleted",
  authController.authenticate,
  diaryController.getDeletedDiaryList
);
router.get("/:id", authController.authenticate, diaryController.getDiaryDetail);
router.put("/:id", authController.authenticate, diaryController.updateDiary);
router.delete("/:id", authController.authenticate, diaryController.deleteDiary);
router.patch(
  "/restore/:id",
  authController.authenticate,
  diaryController.restoreDiary
);

module.exports = router;
