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
    openaiController.createPrintLine)

// POST /api/chatbot/comment
router.post(
    "/comment", 
    openaiController.chatbotMessagePersonality,
    openaiController.createChatbotMessage)

// GET /api/chatbot - 사용자의 모든 챗봇을 가져옴 / 메인에서 필요한 이미지와 좌표를 가져옴.
router.get(
    "/", 
    authController.authenticate, 
    chatbotController.getChatbots
);

// PUT /api/chatbot/:chatbotId/position
router.put(
    "/:chatbotId/position",
    authController.authenticate,
    chatbotController.updateChatbotPosition
)

// PUT /api/chatbot/:chatbotId/name
router.put("/:chatbotId/name", chatbotController.updateName);

// DELETE /api/chatbot/:chatbotId
router.delete("/:chatbotId", chatbotController.deleteChatbot);

module.exports = router;
