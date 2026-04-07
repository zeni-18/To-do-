const express = require('express');
const router = express.Router();
const { getAllUsers, getGlobalStats } = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', getAllUsers);
router.get('/stats', getGlobalStats);

module.exports = router;
