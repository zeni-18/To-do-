import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  ArrowLeft, TrendingUp, Clock, AlertCircle, CheckCircle, 
  BarChart2, PieChart, Timer, Calendar, User as UserIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart as RePie, Pie
} from 'recharts';

const AdminUserAnalysis = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get(`/admin/user-insights/${userId}`),
          api.get('/admin/users')
        ]);
        
        setStats(statsRes.data);
        const targetUser = usersRes.data.find(u => u._id === userId);
        setUserName(targetUser?.name || 'User');
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <div className="loading">Analyzing user performance...</div>;

  const chartData = stats.hourlyStats.map((count, hour) => ({
    hour: `${hour}:00`,
    tasks: count
  }));

  const pieData = [
    { name: 'Pending', value: stats.statusDistribution.pending, color: 'hsl(220 90% 50%)' },
    { name: 'In Progress', value: stats.statusDistribution['in progress'], color: 'hsl(45 90% 40%)' },
    { name: 'Completed', value: stats.statusDistribution.completed, color: 'hsl(150 80% 40%)' }
  ];

  return (
    <div className="analysis-page">
      <header className="analysis-header">
        <button onClick={() => navigate('/admin')} className="btn-back">
          <ArrowLeft size={20} />
          <span>Back to Control Center</span>
        </button>
        <div className="header-content">
          <div className="user-icon-lg glass">
            <UserIcon size={32} />
          </div>
          <div>
            <h1>{userName}'s Performance Profile</h1>
            <p>Read-only deep-dive analysis of productivity and activity.</p>
          </div>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card card glass">
          <CheckCircle size={24} className="green" />
          <div className="stat-info">
            <span className="stat-label">Completion Rate</span>
            <h2 className="stat-value">{Math.round(stats.completionRate)}%</h2>
          </div>
        </div>
        <div className="stat-card card glass">
          <Timer size={24} className="blue" />
          <div className="stat-info">
            <span className="stat-label">Avg. Efficiency</span>
            <h2 className="stat-value">{Math.round(stats.avgCompletionTime)}m</h2>
            <span className="stat-sub">per task</span>
          </div>
        </div>
        <div className="stat-card card glass">
          <TrendingUp size={24} className="purple" />
          <div className="stat-info">
            <span className="stat-label">Peak Hour</span>
            <h2 className="stat-value">{stats.mostProductiveHour}:00</h2>
          </div>
        </div>
        <div className="stat-card card glass">
          <AlertCircle size={24} className="red" />
          <div className="stat-info">
            <span className="stat-label">Missed Deadlines</span>
            <h2 className="stat-value">{stats.missedDeadlines}</h2>
          </div>
        </div>
      </section>

      <div className="analysis-grid">
        <div className="analysis-card card glass">
          <div className="card-header">
            <BarChart2 size={20} />
            <h3>Hourly Productivity</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--muted-foreground), 0.1)" />
                <XAxis dataKey="hour" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analysis-card card glass">
          <div className="card-header">
            <PieChart size={20} />
            <h3>Activity Distribution</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <RePie>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
              </RePie>
            </ResponsiveContainer>
            <div className="pie-legend">
              {pieData.map((d, i) => (
                <div key={i} className="legend-item">
                  <span className="dot" style={{ background: d.color }}></span>
                  <span className="label">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="logs-section">
        <div className="logs-card card glass">
          <div className="card-header">
            <Clock size={20} />
            <h3>Recent Efficiency Logs</h3>
          </div>
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {stats.completionTimeList.length > 0 ? (
                  stats.completionTimeList.map((l, i) => (
                    <tr key={i}>
                      <td>{l.title}</td>
                      <td><span className="status-badge-sm">Completed</span></td>
                      <td>{Math.round(l.duration)} minutes</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="empty-msg">No completed activity logs yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .analysis-page { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
        .analysis-header { margin-bottom: 2.5rem; }
        .btn-back { 
          display: flex; align-items: center; gap: 0.5rem; background: none; border: none; 
          color: hsl(var(--muted-foreground)); cursor: pointer; transition: color 0.2s;
          margin-bottom: 1.5rem; padding: 0.5rem 0;
        }
        .btn-back:hover { color: hsl(var(--primary)); }
        
        .header-content { display: flex; align-items: center; gap: 1.5rem; }
        .user-icon-lg { 
          width: 64px; height: 64px; border-radius: 18px; display: flex; 
          align-items: center; justify-content: center; color: hsl(var(--primary));
        }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem; }
        .stat-info { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.8rem; color: hsl(var(--muted-foreground)); font-weight: 600; }
        .stat-value { font-size: 1.75rem; font-weight: 800; line-height: 1.1; }
        .stat-sub { font-size: 0.7rem; color: hsl(var(--muted-foreground)); }

        .stat-card .green { color: hsl(150 80% 40%); }
        .stat-card .blue { color: hsl(220 90% 50%); }
        .stat-card .purple { color: hsl(280 80% 50%); }
        .stat-card .red { color: hsl(0 80% 50%); }

        .analysis-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .analysis-card { padding: 1.5rem; }
        .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; color: hsl(var(--foreground)); }
        .card-header h3 { font-size: 1.1rem; font-weight: 700; }

        .pie-legend { display: flex; justify-content: center; gap: 1.5rem; margin-top: 1rem; }
        .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }

        .logs-card { padding: 1.5rem; }
        .logs-table-container { overflow-x: auto; }
        .logs-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .logs-table th { text-align: left; padding: 1rem; border-bottom: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground)); }
        .logs-table td { padding: 1rem; border-bottom: 1px solid hsl(var(--border)); }
        .status-badge-sm { background: hsl(150 80% 95%); color: hsl(150 80% 40%); padding: 0.15rem 0.6rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }
        .empty-msg { text-align: center; color: hsl(var(--muted-foreground)); padding: 2rem; }

        .loading { padding: 5rem; text-align: center; font-weight: 700; color: hsl(var(--muted-foreground)); }
      `}} />
    </div>
  );
};

export default AdminUserAnalysis;
