const Task = require('../models/Task');

const createTask = async (req, res) => {
  try {
    const { title, description, priority, deadline } = req.body;
    const task = new Task({ title, description, priority, deadline, user: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getTasks = async (req, res) => {
  try {
    const { status, priority, sort } = req.query;
    let query = { user: req.user.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    let sortOption = {};
    if (sort === 'deadline') sortOption.deadline = 1;
    else if (sort === 'priority') sortOption.priority = -1;
    else sortOption.createdAt = -1;

    const tasks = await Task.find(query).sort(sortOption);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, priority, deadline, status } = req.body;
    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.title = title || task.title;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.deadline = deadline || task.deadline;
    
    if (status && status !== task.status) {
      if (status === 'in progress' && !task.inProgressAt) {
        task.inProgressAt = new Date();
      }
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getInsights = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    const missedDeadlines = tasks.filter(t => {
      if (t.status === 'completed') {
        return t.deadline && new Date(t.completedAt) > new Date(t.deadline);
      }
      return t.deadline && new Date() > new Date(t.deadline);
    }).length;

    // Productivity by hour
    const hourlyStats = Array(24).fill(0);
    tasks.forEach(t => {
      if (t.completedAt) {
        const hour = new Date(t.completedAt).getHours();
        hourlyStats[hour]++;
      }
    });

    const mostProductiveHour = hourlyStats.indexOf(Math.max(...hourlyStats));

    // Average time to complete (from In Progress to Completed)
    const completedWithTimestamps = tasks.filter(t => t.status === 'completed' && t.inProgressAt && t.completedAt);
    let avgCompletionTime = 0;
    if (completedWithTimestamps.length > 0) {
      const totalTime = completedWithTimestamps.reduce((acc, t) => {
        return acc + (new Date(t.completedAt) - new Date(t.inProgressAt));
      }, 0);
      avgCompletionTime = (totalTime / completedWithTimestamps.length) / (1000 * 60); // In minutes
    }

    // Distributions
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

module.exports = { createTask, getTasks, updateTask, deleteTask, getInsights };
