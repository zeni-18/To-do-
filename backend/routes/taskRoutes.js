const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, getInsights } = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/insights', getInsights);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
