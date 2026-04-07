const express = require('express');
const router = express.Router();
const { getAllUsers, getGlobalStats, getUserTasks, getUserInsights } = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', getAllUsers);
router.get('/stats', getGlobalStats);
router.get('/user-tasks/:userId', getUserTasks);
router.get('/user-insights/:userId', getUserInsights);
router.get('/ping', (req, res) => res.json({ message: 'Admin module active' }));

module.exports = router;
