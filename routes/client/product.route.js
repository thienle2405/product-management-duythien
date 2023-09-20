const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/product.controller")

router.get('/', controller.index);

router.get('/:slug', controller.detail);

// router.get('/create', );

// router.get('/edit', );

module.exports = router;