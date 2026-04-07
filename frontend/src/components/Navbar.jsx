import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Layout, BarChart, Settings, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Layout className="logo-icon" />
          <span>ZenTasks</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">
            <Layout size={18} />
            <span>Board</span>
          </Link>
          <Link to="/productivity" className="nav-link">
            <BarChart size={18} />
            <span>Stats</span>
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="nav-link">
              <Settings size={18} />
              <span>Admin</span>
            </Link>
          )}
        </div>

        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <div className="nav-user">
            <div className="user-avatar">
              <User size={16} />
            </div>
            <span className="user-name">{user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 64px;
          border-bottom: 1px solid hsl(var(--border));
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: hsl(var(--primary));
        }
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: hsl(var(--foreground));
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .theme-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: hsl(var(--foreground));
          display: flex;
          align-items: center;
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius);
          background: hsl(var(--secondary));
        }
        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: hsl(var(--primary));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
        }
        .logout-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: hsl(var(--muted-foreground));
          display: flex;
          align-items: center;
        }
        .logout-btn:hover {
          color: hsl(var(--destructive));
        }
      `}} />
    </nav>
  );
};

export default Navbar;
