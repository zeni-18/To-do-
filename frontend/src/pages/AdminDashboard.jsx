import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, FileText, CheckCircle, TrendingUp, ShieldCheck, Mail, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm">{u.name.charAt(0)}</div>
                      <span className="user-name">{u.name}</span>
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
                    <div className="date-cell">
                      <Calendar size={14} />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
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
        .stat-card .blue { color: hsl(220 90% 50%); }
        .stat-card .yellow { color: hsl(45 90% 40%); }
        .stat-card .green { color: hsl(150 80% 40%); }
        .stat-card .purple { color: hsl(280 80% 50%); }

        .user-management { padding: 1.5rem; overflow: hidden; }
        .section-header { margin-bottom: 1.5rem; }
        
        .user-table-container { overflow-x: auto; }
        .user-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .user-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          color: hsl(var(--muted-foreground));
          font-weight: 600;
          border-bottom: 1px solid hsl(var(--border));
        }
        .user-table td {
          padding: 1rem;
          border-bottom: 1px solid hsl(var(--border));
        }
        
        .user-cell { display: flex; align-items: center; gap: 0.75rem; }
        .user-avatar-sm {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: hsl(var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
        }
        .user-name { font-weight: 600; }
        
        .email-cell, .date-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: hsl(var(--muted-foreground));
        }
        
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
