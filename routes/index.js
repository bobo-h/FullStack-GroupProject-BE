const express = require("express");
const router = express.Router();
const userApi = require("./user.api");
const authApi = require("./auth.api");
const diaryApi = require("./diary.api");
const chatbotApi = require("./chatbot.api");

router.use("/user", userApi);
router.use("/auth", authApi);
router.use("/diary", diaryApi);
router.use("/chatbot", chatbotApi);

module.exports = router;
