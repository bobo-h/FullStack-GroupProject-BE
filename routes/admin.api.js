const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// 회원 리스트 가져오기
router.get("/allUser", adminController.getAllUser);
// 탈퇴일로부터 90일이내의 회원 (로그인 자격 X)
router.get("/ineligibleUser", adminController.getIneligibleUser);
// 탈퇴일로부터 90일이상의 회원 (로그인 자격 O)
router.get("/eligibleUser", adminController.getEligibleUser);
// 관리자 리스트 가져오기
router.get("/allAdmin", adminController.getAllAdmin);
// 역할 수정
router.put("/:id", adminController.editLevel);
// 탈퇴일로부터 90일이상의 회원 (로그인 자격 O) 모두 삭제하기
router.delete("/", adminController.deleteAllEligibleUsers);
// 유저 검색
router.get("/users", adminController.getSearchUsers);

module.exports = router;
