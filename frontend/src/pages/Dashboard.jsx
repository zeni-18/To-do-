import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Filter, Search, Calendar, Tag, CheckCircle2, Circle, Clock, Trash2, Edit } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  
  // New Task form state
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', deadline: '' });

  const fetchTasks = async () => {
    try {
      const { status, priority } = filter;
      const res = await api.get('/tasks', { params: { status, priority } });
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      setNewTask({ title: '', description: '', priority: 'medium', deadline: '' });
      setIsAdding(false);
      fetchTasks();
    } catch (err) {
      alert('Failed to add task');
    }
  };

  const handleToggleStatus = async (task) => {
    let nextStatus;
    if (task.status === 'pending') nextStatus = 'in progress';
    else if (task.status === 'in progress') nextStatus = 'completed';
    else nextStatus = 'pending';

    try {
      await api.put(`/tasks/${task._id}`, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Your Board</h1>
          <p>Organize your day and boost focus.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="btn btn-primary add-task-btn">
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </header>

      <section className="controls">
        <div className="search-bar glass">
          <Search size={16} />
          <input type="text" placeholder="Search tasks..." />
        </div>
        <div className="filters">
          <select value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})} className="filter-select glass">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={filter.priority} onChange={(e) => setFilter({...filter, priority: e.target.value})} className="filter-select glass">
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </section>

      {isAdding && (
        <div className="modal-overlay">
          <div className="task-form-card card glass anim-fade-in">
            <h2>Create New Task</h2>
            <form onSubmit={handleAddTask}>
              <input 
                className="form-input"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                required
              />
              <textarea 
                className="form-textarea"
                placeholder="Description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
              <div className="form-row">
                <select 
                  className="form-select"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input 
                  type="date"
                  className="form-input"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="task-grid">
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={48} />
            <h3>No tasks found</h3>
            <p>Ready to start something new?</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task._id} className={`task-card card ${task.status.replace(' ', '-')}`}>
              <div className="task-card-header">
                <button onClick={() => handleToggleStatus(task)} className={`status-toggle ${task.status.replace(' ', '-')}`}>
                  {task.status === 'completed' ? (
                    <CheckCircle2 size={22} className="checked" />
                  ) : task.status === 'in progress' ? (
                    <Clock size={22} className="progress-icon" />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>
                <div className="task-info">
                  <h3>{task.title}</h3>
                  <div className="task-meta">
                    {task.deadline && (
                      <span className="meta-item">
                        <Calendar size={12} />
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  <button onClick={() => handleDeleteTask(task._id)} className="action-btn delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {task.description && <p className="task-desc">{task.description}</p>}
            </div>
          ))
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2.5rem;
        }
        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 800;
        }
        .dashboard-header p {
          color: hsl(var(--muted-foreground));
          margin-top: 0.25rem;
        }
        .controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .search-bar {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          gap: 0.75rem;
          border-radius: var(--radius);
          min-width: 280px;
        }
        .search-bar input {
          background: none;
          border: none;
          outline: none;
          width: 100%;
        }
        .filters {
          display: flex;
          gap: 0.75rem;
        }
        .filter-select {
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          border: 1px solid hsl(var(--border));
          outline: none;
        }
        
        .task-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .task-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .task-card.completed {
          opacity: 0.7;
        }
        .task-card.completed h3 {
          text-decoration: line-through;
        }
        .task-card.in-progress {
          border-left: 4px solid #f59e0b;
          background: linear-gradient(to right, hsla(45, 100%, 50%, 0.05), transparent);
        }
        .status-toggle.in-progress .progress-icon {
          color: #f59e0b;
        }
        .task-card-header {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .status-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: hsl(var(--muted-foreground));
          padding: 0;
          margin-top: 2px;
        }
        .status-toggle .checked {
          color: hsl(var(--primary));
        }
        .task-info {
          flex: 1;
        }
        .task-info h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .task-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: hsl(var(--muted-foreground));
        }
        .priority-badge {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .priority-badge.low { background: hsl(150 80% 90%); color: hsl(150 80% 30%); }
        .priority-badge.medium { background: hsl(45 90% 90%); color: hsl(45 90% 30%); }
        .priority-badge.high { background: hsl(0 90% 95%); color: hsl(0 90% 40%); }
        
        .task-desc {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: hsl(var(--muted-foreground));
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: hsl(var(--muted-foreground));
          opacity: 0;
          transition: opacity 0.2s;
        }
        .task-card:hover .action-btn {
          opacity: 1;
        }
        .action-btn.delete:hover {
          color: hsl(var(--destructive));
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .task-form-card {
          width: 100%;
          max-width: 500px;
          padding: 2rem;
        }
        .form-input, .form-textarea, .form-select {
          width: 100%;
          margin-bottom: 1rem;
          padding: 0.75rem;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          background: hsl(var(--background));
        }
        .form-textarea { height: 100px; resize: none; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
        
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem;
          color: hsl(var(--muted-foreground));
        }
      `}} />
    </div>
  );
};

export default Dashboard;
