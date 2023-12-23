const express = require("express");
const multer = require("multer");
const router = express.Router();

const controller = require("../../controllers/admin/order.controller");
const validate = require("../../validates/admin/product.validate");

router.get("/", controller.index);
router.patch("/change-multi", controller.changeMulti);
module.exports = router;