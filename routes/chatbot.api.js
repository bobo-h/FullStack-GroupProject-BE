const express = require("express");
const router = express.Router();
const chabotController = require("../controllers/chatbot.controller");

router.post("/", chabotController.createChatbot);
router.post("/printLine", chabotController.createPrintLine)


module.exports=router;