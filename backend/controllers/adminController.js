const User = require('../models/User');
const Task = require('../models/Task');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getGlobalStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    
    // Most active user
    const mostActiveUsers = await Task.aggregate([
      { $group: { _id: '$user', taskCount: { $sum: 1 } } },
      { $sort: { taskCount: -1 } },
      { $limit: 1 }
    ]);

    res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      mostActiveUser: mostActiveUsers[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, getGlobalStats };
