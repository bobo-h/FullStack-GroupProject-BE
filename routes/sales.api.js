const express = require("express");
const salesController = require("../controllers/sales.controller")
const router = express.Router();


router.get("/product", salesController.getProductSales);
router.get("/daily", salesController.getDailySales);

module.exports = router;