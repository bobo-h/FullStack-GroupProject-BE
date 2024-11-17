const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbot.controller");
const authController = require("../controllers/auth.controller");

// POST /api/chatbot/
router.post("/", chatbotController.createChatbot);

// POST /api/chatbot/printLine
router.post("/printLine", chatbotController.createPrintLine)

// GET /api/chatbot - 사용자의 모든 챗봇을 가져옴 / 메인에서 필요한 이미지와 좌표를 가져옴.
router.get("/", authController.authenticate, chatbotController.getChatbots); // post와 get 도두 사용자 인증 미들웨어 필요함.

// PUT /api/chatbot/:chatbotId/position
router.put("/:chatbotId/position",chatbotController.updateChatbotPosition)

// PUT /api/chatbot/:chatbotId/name
router.put("/:chatbotId/name", chatbotController.updateName);

// DELETE /api/chatbot/:chatbotId
router.delete("/:chatbotId", chatbotController.deleteChatbot);

module.exports = router;
