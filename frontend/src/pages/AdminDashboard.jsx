import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, FileText, CheckCircle, TrendingUp, ShieldCheck, Mail, Calendar, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [expandedUser, setExpandedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats')
        ]);
        setUsers(usersRes.data);
        setStats(statsRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const toggleUserTasks = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    setTasksLoading(true);
    try {
      const res = await api.get(`/admin/user-tasks/${userId}`);
      setUserTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTasksLoading(false);
    }
  };

  if (loading) return <div className="loading">Fetching administrative data...</div>;

  return (
    <div className="admin-page">
      <header className="page-header">
        <div className="header-icon">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h1>Admin Command Center</h1>
          <p>Global oversight and management.</p>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card card glass">
          <Users size={20} className="blue" />
          <div className="stat-info">
            <span className="stat-label">Total Users</span>
            <h2 className="stat-value">{stats.totalUsers}</h2>
          </div>
        </div>
        <div className="stat-card card glass">
          <FileText size={20} className="yellow" />
          <div className="stat-info">
            <span className="stat-label">Total Tasks</span>
            <h2 className="stat-value">{stats.totalTasks}</h2>
          </div>
        </div>
        <div className="stat-card card glass">
          <CheckCircle size={20} className="green" />
          <div className="stat-info">
            <span className="stat-label">Completed Tasks</span>
            <h2 className="stat-value">{stats.completedTasks}</h2>
          </div>
        </div>
        <div className="stat-card card glass">
          <TrendingUp size={20} className="purple" />
          <div className="stat-info">
            <span className="stat-label">Success Rate</span>
            <h2 className="stat-value">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
            </h2>
          </div>
        </div>
      </section>

      <section className="user-management card glass">
        <div className="section-header">
          <h3>Registered Users</h3>
        </div>
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Tasks</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <React.Fragment key={u._id}>
                  <tr className={expandedUser === u._id ? 'expanded' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm">{u.name?.charAt(0) || '?'}</div>
                        <span className="user-name">{u.name || 'Anonymous User'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="email-cell">
                        <Mail size={14} />
                        {u.email}
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button 
                          className={`btn-icon-subtle ${expandedUser === u._id ? 'active' : ''}`}
                          onClick={() => toggleUserTasks(u._id)}
                          title="View User Tasks"
                        >
                          <FileText size={16} />
                        </button>
                        <button 
                          className="btn-icon-subtle"
                          onClick={() => navigate(`/admin/performance/${u._id}`)}
                          title="Analyze Performance"
                        >
                          <BarChart2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                  {expandedUser === u._id && (
                    <tr className="task-row anim-scale-in">
                      <td colSpan="5">
                        <div className="user-tasks-panel glass">
                          {tasksLoading ? (
                            <p className="loading-sm">Loading tasks...</p>
                          ) : userTasks.length > 0 ? (
                            <div className="task-grid-mini">
                              {userTasks.map(t => (
                                <div key={t._id} className="task-pill">
                                  <div className="task-pill-info">
                                    <span className="task-pill-title">{t.title}</span>
                                    <span className={`task-pill-status ${t.status.replace(' ', '-')}`}>{t.status}</span>
                                  </div>
                                  <div className="task-pill-meta">
                                    <span className={`task-pill-priority ${t.priority}`}>{t.priority}</span>
                                    {t.deadline && <span className="task-pill-date">{new Date(t.deadline).toLocaleDateString()}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="empty-sm">This user hasn't created any tasks yet.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }
        .page-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .header-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: hsl(var(--primary));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
        }
        .user-table tr { transition: background 0.2s; }
        .user-table tr.expanded { background: hsla(var(--primary), 0.02); }
        .user-table tr.expanded td { border-bottom-color: transparent; }
        
        .action-cell { display: flex; align-items: center; gap: 0.5rem; }

        .btn-icon-subtle {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid hsl(var(--border));
          color: hsl(var(--muted-foreground));
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-icon-subtle:hover, .btn-icon-subtle.active {
          background: hsl(var(--primary));
          color: white;
          border-color: hsl(var(--primary));
        }

        .task-row td { padding: 0 1rem 1.5rem 1rem; }
        .user-tasks-panel {
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid hsl(var(--border));
        }
        
        .task-grid-mini {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .task-pill {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          padding: 0.75rem;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .task-pill-info { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
        .task-pill-title { font-weight: 600; font-size: 0.85rem; }
        .task-pill-status {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }
        .task-pill-status.pending { background: #f1f5f9; color: #64748b; }
        .task-pill-status.in-progress { background: #fffbeb; color: #d97706; }
        .task-pill-status.completed { background: #eff6ff; color: #2563eb; }

        .task-pill-meta { display: flex; justify-content: space-between; align-items: center; }
        .task-pill-priority { font-size: 0.7rem; font-weight: 600; text-transform: capitalize; }
        .task-pill-priority.low { color: #10b981; }
        .task-pill-priority.medium { color: #f59e0b; }
        .task-pill-priority.high { color: #ef4444; }
        .task-pill-date { font-size: 0.7rem; color: hsl(var(--muted-foreground)); }

        .loading-sm, .empty-sm { text-align: center; font-size: 0.85rem; color: hsl(var(--muted-foreground)); padding: 1rem; }
        .anim-scale-in { animation: scaleIn 0.2s ease-out; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

        .role-badge {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
        }
        .role-badge.admin { background: hsl(280 80% 95%); color: hsl(280 80% 50%); }
        .role-badge.user { background: hsl(220 90% 95%); color: hsl(220 90% 50%); }
        
        .loading { padding: 4rem; text-align: center; font-weight: 600; color: hsl(var(--muted-foreground)); }
      `}} />
    </div>
  );
};

export default AdminDashboard;
