const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/product.controller")

router.get('/', controller.index);

router.get('/:slugCategory', controller.category);

router.get('/detail/:slugCategory', controller.detail);

// router.get('/create', );

// router.get('/edit', );

module.exports = router;