const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbot.controller");
const openaiController = require("../controllers/openai.controller");
const authController = require("../controllers/auth.controller");

router.post(
  "/", 
  authController.authenticate, 
  chatbotController.createChatbot
);

router.post(
  "/printLine",
  openaiController.createPrintLine
);

router.get(
  "/me", 
  authController.authenticate, 
  chatbotController.getChatbots
);

router.put(
  "/:id",
  authController.authenticate,
  chatbotController.updateChatbotJins
);

router.put(
  "/",
  authController.authenticate,
  chatbotController.updateChatbotsByUser
);

router.get(
  "/:userId",
  authController.authenticate,
  chatbotController.getChatbots
);

router.get(
  "/:userId/:chatbotId",
  authController.authenticate,
  chatbotController.getChatbots
);

router.put(
  "/:chatbotId/position",
  authController.authenticate,
  chatbotController.updateChatbotPosition
);

router.put(
  "/:chatbotId/name", 
  chatbotController.updateName
);

router.delete(
  "/:chatbotId", 
  chatbotController.deleteChatbot
);

module.exports = router;
