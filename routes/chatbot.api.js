const express = require("express");
const router = express.Router();
const chabotController = require("../controllers/chatbot.controller");

router.post("/", chabotController.createChatbot);

// GET /api/chatbots - 사용자의 모든 챗봇을 가져옴 / 메인에서 필요한 이미지와 좌표를 가져옴.
// router.get("/", chatbotController.getChatbots); // post와 get 도두 사용자 인증 미들웨어 필요함.

// PUT /api/chatbots/:chatbotId/position
// router.put("/:chatbotId/position",chatbotController.updateChatbotPosition)
module.exports = router;
