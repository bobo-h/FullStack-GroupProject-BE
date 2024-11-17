const express = require("express");
// const authController = require("../controllers/auth.controller");
const moodController = require("../controllers/mood.controller")
const router = express.Router();

router.post("/",
    // authController.authenticate,
    // authController.checkAdminPermission,
    moodController.createMood)

router.get("/", moodController.getMoods);

router.put("/:id", 
    // authController.authenticate,authController.checkAdminPermission,
    moodController.updateMood)

router.delete("/:id",
    // authController.authenticate, authController.checkAdminPermission,
    moodController.deleteMood)

module.exports = router;
