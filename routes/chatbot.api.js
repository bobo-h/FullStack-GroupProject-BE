const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbot.controller");
const openaiController = require("../controllers/openai.controller");
const authController = require("../controllers/auth.controller");

// POST /api/chatbot/
router.post("/", chatbotController.createChatbot);

// POST /api/chatbot/printLine
router.post(
  "/printLine",
  openaiController.chatbotMessagePersonality,
  openaiController.createPrintLine
);

// POST /api/chatbot/comment
router.post(
  "/comment",
  openaiController.chatbotMessagePersonality,
  openaiController.createChatbotMessage
);

// =========== 신진수 추가 =================//
// GET /api/chatbot/me - 사용자의 챗봇을 가져옴
router.get("/me", authController.authenticate, chatbotController.getChatbots);

// PUT /api/chatbot/:id - 특정 챗봇 정보 업데이트
router.put(
  "/:id",
  authController.authenticate,
  chatbotController.updateChatbotJins
);
// =========== 신진수 추가 끝 =================//

// GET /api/chatbot/:userId - 사용자의 모든 챗봇을 가져옴
router.get(
  "/:userId",
  authController.authenticate,
  chatbotController.getChatbots
);

// GET /api/chatbot/:userId/:chatbotId - 사용자의 특정 챗봇을 가져옴
router.get(
  "/:userId/:chatbotId",
  authController.authenticate,
  chatbotController.getChatbots
);

// PUT /api/chatbot/:chatbotId/position
router.put(
  "/:chatbotId/position",
  authController.authenticate,
  chatbotController.updateChatbotPosition
);

// PUT /api/chatbot/:chatbotId/name
router.put("/:chatbotId/name", chatbotController.updateName);

// DELETE /api/chatbot/:chatbotId
router.delete("/:chatbotId", chatbotController.deleteChatbot);

module.exports = router;
