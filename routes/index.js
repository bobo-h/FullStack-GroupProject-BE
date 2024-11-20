const express = require("express");
const router = express.Router();
const userApi = require("./user.api");
const authApi = require("./auth.api");
const diaryApi = require("./diary.api");
const chatbotApi = require("./chatbot.api");
const productApi = require("./product.api");
const orderApi = require("./order.api");
const moodApi = require("./mood.api");
const adminApi = require("./admin.api");
const salesApi = require("./sales.api");

router.use("/user", userApi);
router.use("/auth", authApi);
router.use("/diary", diaryApi);
router.use("/chatbot", chatbotApi);
router.use("/product", productApi);
router.use("/order", orderApi);
router.use("/mood", moodApi);
router.use("/admin", adminApi);
router.use("/sales", salesApi)

module.exports = router;
