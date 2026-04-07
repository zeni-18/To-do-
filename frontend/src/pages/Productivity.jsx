import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend
} from 'recharts';
import { Target, Zap, Clock, AlertTriangle, TrendingUp, Award, ChevronRight, Activity } from 'lucide-react';

const Productivity = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState('completion'); // completion, efficiency, peak, deadlines

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/tasks/insights');
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading">Analyzing your performance...</div>;

  const chartData = stats?.hourlyStats?.map((count, hour) => ({
    hour: `${hour}:00`,
    count
  })) || [];

  const statusData = [
    { name: 'Pending', value: stats?.statusDistribution?.pending || 0, color: '#94a3b8' },
    { name: 'In Progress', value: stats?.statusDistribution?.['in progress'] || 0, color: '#f59e0b' },
    { name: 'Completed', value: stats?.statusDistribution?.completed || 0, color: '#3b82f6' },
  ].filter(i => i.value > 0);

  const priorityData = [
    { name: 'Low', value: stats?.priorityDistribution?.low || 0, color: '#10b981' },
    { name: 'Medium', value: stats?.priorityDistribution?.medium || 0, color: '#f59e0b' },
    { name: 'High', value: stats?.priorityDistribution?.high || 0, color: '#ef4444' },
  ].filter(i => i.value > 0);

  const StatCard = ({ id, icon: Icon, label, value, color, subtext }) => (
    <div 
      className={`stat-card card glass clickable ${activeCard === id ? 'active' : ''}`}
      onClick={() => setActiveCard(id)}
    >
      <div className={`stat-icon ${color}`}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <h2 className="stat-value">{value}</h2>
        <span className="stat-subtext">{subtext}</span>
      </div>
      <ChevronRight size={16} className="card-arrow" />
    </div>
  );

  const renderAnalysis = () => {
    switch (activeCard) {
      case 'completion':
        return (
          <div className="analysis-grid anim-fade-in">
            <div className="analysis-card card glass">
              <h3>Status Distribution</h3>
              <div className="chart-container-sm">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="analysis-card card glass">
              <h3>Priority Breakdown</h3>
              <div className="chart-container-sm">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'efficiency':
        return (
          <div className="analysis-details card glass anim-fade-in">
            <h3>Recent Completion Times</h3>
            <div className="time-list">
              {stats?.completionTimeList?.length > 0 ? (
                stats.completionTimeList.map((t, i) => (
                  <div key={i} className="time-item">
                    <span className="time-title">{t?.title}</span>
                    <span className="time-value">
                      {t?.duration > 60 ? `${(t.duration/60).toFixed(1)}h` : `${Math.round(t?.duration || 0)}m`}
                    </span>
                  </div>
                ))
              ) : (
                <p className="empty-text">No completed tasks yet.</p>
              )}
            </div>
          </div>
        );
      case 'deadlines':
        return (
          <div className="analysis-details card glass anim-fade-in">
            <h3>Missed Deadline Log</h3>
            <div className="deadline-table-container">
              {stats?.missedDeadlineList?.length > 0 ? (
                <table className="deadline-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.missedDeadlineList.map((t, i) => (
                      <tr key={i}>
                        <td>{t?.title}</td>
                        <td>{t?.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A'}</td>
                        <td><span className={`status-pill ${t?.status?.replace(' ', '-') || 'pending'}`}>{t?.status || 'pending'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-text">No missed deadlines! Great job.</p>
              )}
            </div>
          </div>
        );
      case 'peak':
        return (
          <div className="analysis-details card glass anim-fade-in">
            <h3>Task Completion Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: 'hsla(var(--primary), 0.05)' }}
                  />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.count > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="productivity-page">
      <header className="page-header">
        <h1>Productivity Insights</h1>
        <p>Click any card below for perfect detailed analysis.</p>
      </header>

      <div className="stats-grid">
        <StatCard 
          id="completion"
          icon={Target} 
          label="Completion Rate" 
          value={`${Math.round(stats?.completionRate || 0)}%`}
          color="blue"
          subtext={`${stats?.completed || 0} of ${stats?.total || 0} tasks done`}
        />
        <StatCard 
          id="efficiency"
          icon={TrendingUp} 
          label="Work Efficiency" 
          value={
            stats?.avgCompletionTime > 60 
              ? `${(stats.avgCompletionTime / 60).toFixed(1)}h` 
              : `${Math.round(stats?.avgCompletionTime || 0)}m`
          }
          color="purple"
          subtext="Avg. time from Start to Done"
        />
        <StatCard 
          id="peak"
          icon={Zap} 
          label="Peak Productivity" 
          value={`${stats?.mostProductiveHour || 0}:00`}
          color="yellow"
          subtext="Hour with most completions"
        />
        <StatCard 
          id="deadlines"
          icon={AlertTriangle} 
          label="Missed Deadlines" 
          value={stats?.missedDeadlines || 0}
          color="red"
          subtext="Tasks completed after due date"
        />
      </div>

      <section className="analysis-section">
        <div className="analysis-header">
          <Activity size={20} />
          <h2>Detailed Analysis</h2>
        </div>
        {renderAnalysis()}
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .productivity-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }
        .page-header { margin-bottom: 2.5rem; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .stat-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card.clickable { cursor: pointer; }
        .stat-card.clickable:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 12px 24px rgba(0,0,0,0.1); 
        }
        .stat-card.active {
          border-color: hsl(var(--primary));
          background: hsla(var(--primary), 0.03);
          box-shadow: inset 0 0 0 1px hsl(var(--primary));
        }
        .card-arrow {
          position: absolute;
          right: 1rem;
          opacity: 0.3;
          transition: transform 0.3s;
        }
        .stat-card.active .card-arrow { color: hsl(var(--primary)); opacity: 1; transform: translateX(4px); }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-icon.blue { background: hsl(220 90% 95%); color: hsl(220 90% 50%); }
        .stat-icon.yellow { background: hsl(45 90% 95%); color: hsl(45 90% 40%); }
        .stat-icon.red { background: hsl(0 90% 95%); color: hsl(0 90% 50%); }
        .stat-icon.purple { background: hsl(280 80% 95%); color: hsl(280 80% 50%); }
        
        .stat-info { display: flex; flex-direction: column; overflow: hidden; }
        .stat-label { font-size: 0.8rem; color: hsl(var(--muted-foreground)); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value { font-size: 1.75rem; font-weight: 800; margin: 0.2rem 0; }
        .stat-subtext { font-size: 0.75rem; color: hsl(var(--muted-foreground)); white-space: nowrap; }

        .analysis-section { margin-top: 1rem; }
        .analysis-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; color: hsl(var(--primary)); }
        .analysis-header h2 { font-size: 1.5rem; font-weight: 700; }
        
        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .analysis-card { padding: 1.5rem; }
        .analysis-card h3 { font-size: 1rem; margin-bottom: 1.5rem; color: hsl(var(--muted-foreground)); }
        
        .analysis-details { padding: 2rem; }
        .analysis-details h3 { font-size: 1.1rem; margin-bottom: 1.5rem; }
        
        .time-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .time-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: hsl(var(--secondary));
          border-radius: var(--radius);
        }
        .time-title { font-weight: 600; }
        .time-value { font-weight: 700; color: hsl(var(--primary)); }

        .deadline-table-container { overflow-x: auto; }
        .deadline-table { width: 100%; border-collapse: collapse; }
        .deadline-table th { text-align: left; padding: 1rem; border-bottom: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground)); }
        .deadline-table td { padding: 1rem; border-bottom: 1px solid hsl(var(--border)); }
        
        .status-pill {
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pill.pending { background: #f1f5f9; color: #64748b; }
        .status-pill.in-progress { background: #fffbeb; color: #d97706; }
        .status-pill.completed { background: #eff6ff; color: #2563eb; }

        .empty-text { text-align: center; color: hsl(var(--muted-foreground)); padding: 2rem; }
        .anim-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .loading { height: 400px; display: flex; align-items: center; justify-content: center; font-weight: 600; }
      `}} />
    </div>
  );
};

export default Productivity;

