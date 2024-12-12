const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

router.get("/allUser", adminController.getAllUser);
router.get("/ineligibleUser", adminController.getIneligibleUser);
router.get("/eligibleUser", adminController.getEligibleUser);
router.get("/allAdmin", adminController.getAllAdmin);
router.put("/:id", adminController.editLevel);
router.delete("/", adminController.deleteAllEligibleUsers);
router.get("/users", adminController.getSearchUsers);

module.exports = router;
