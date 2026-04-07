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

const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserInsights = async (req, res) => {
  try {
    const userId = req.params.userId;
    const tasks = await Task.find({ user: userId });
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    const missedDeadlines = tasks.filter(t => {
      if (t.status === 'completed') {
        return t.deadline && new Date(t.completedAt) > new Date(t.deadline);
      }
      return t.deadline && new Date() > new Date(t.deadline);
    }).length;

    const hourlyStats = Array(24).fill(0);
    tasks.forEach(t => {
      if (t.completedAt) {
        const hour = new Date(t.completedAt).getHours();
        hourlyStats[hour]++;
      }
    });

    const mostProductiveHour = hourlyStats.indexOf(Math.max(...hourlyStats));

    const completedWithTimestamps = tasks.filter(t => t.status === 'completed' && t.inProgressAt && t.completedAt);
    let avgCompletionTime = 0;
    if (completedWithTimestamps.length > 0) {
      const totalTime = completedWithTimestamps.reduce((acc, t) => {
        return acc + (new Date(t.completedAt) - new Date(t.inProgressAt));
      }, 0);
      avgCompletionTime = (totalTime / completedWithTimestamps.length) / (1000 * 60);
    }

    const statusDistribution = {
      pending: tasks.filter(t => t.status === 'pending').length,
      'in progress': tasks.filter(t => t.status === 'in progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };

    const priorityDistribution = {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
    };

    const missedDeadlineList = tasks
      .filter(t => {
        if (t.status === 'completed') {
          return t.deadline && new Date(t.completedAt) > new Date(t.deadline);
        }
        return t.deadline && new Date() > new Date(t.deadline);
      })
      .map(t => ({ title: t.title, deadline: t.deadline, status: t.status }));

    const completionTimeList = completedWithTimestamps.map(t => ({
      title: t.title,
      duration: (new Date(t.completedAt) - new Date(t.inProgressAt)) / (1000 * 60),
    })).sort((a, b) => b.duration - a.duration);

    res.json({
      total,
      completed,
      completionRate,
      missedDeadlines,
      mostProductiveHour,
      hourlyStats,
      avgCompletionTime,
      statusDistribution,
      priorityDistribution,
      missedDeadlineList,
      completionTimeList
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, getGlobalStats, getUserTasks, getUserInsights };
