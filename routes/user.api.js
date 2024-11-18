const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

// 회원가입
router.post("/", userController.createUser);
// router.post("/login", userController.createUser); userSlice에는 있는데 없음
// router.post("/google", userController.createUser); userSlice에는 있는데 없음

// 토큰이 유효한지 확인 뒤, 토큰을 가지고 유저를 찾아서 리턴
router.get("/me", authController.authenticate, userController.getUser);
// 회원정보 수정
router.put("/:id", authController.authenticate, userController.editUser);
// 회원탈퇴
router.delete("/:id", authController.authenticate, userController.deleteUser);
module.exports = router;
