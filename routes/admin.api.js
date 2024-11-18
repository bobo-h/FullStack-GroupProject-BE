const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const adminController = require("../controllers/admin.controller");

// 회원 리스트 가져오기
router.get("/AllUser", adminController.getAllUser);
module.exports = router;
